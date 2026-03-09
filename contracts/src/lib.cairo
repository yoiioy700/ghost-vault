#[starknet::interface]
pub trait IGhostVault<TContractState> {
    fn create_vault(ref self: TContractState, beneficiary: starknet::ContractAddress, period: u64, window_duration: u64);
    fn get_vault(self: @TContractState, owner: starknet::ContractAddress) -> (starknet::ContractAddress, u256, u64, u64, u64); 
    fn deposit(ref self: TContractState, amount: u256);
    fn withdraw(ref self: TContractState, amount: u256);
    fn checkin(ref self: TContractState);
    fn claim_yield(ref self: TContractState);
    fn trigger_inheritance(ref self: TContractState, owner: starknet::ContractAddress);
}

#[starknet::contract]
mod GhostVault {
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess, StoragePointerWriteAccess};
    use starknet::ContractAddress;
    use starknet::{get_caller_address, get_block_timestamp, get_contract_address};
    use openzeppelin_token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use super::IGhostVault;

    #[derive(Copy, Drop, starknet::Store, Serde)]
    struct Vault {
        beneficiary: ContractAddress,
        principal: u256,
        deadline: u64,
        period: u64,
        window_duration: u64,
        is_active: bool,
    }

    #[storage]
    struct Storage {
        token_address: ContractAddress,
        vaults: Map::<ContractAddress, Vault>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        VaultCreated: VaultCreated,
        Deposited: Deposited,
        Withdrawn: Withdrawn,
        CheckedIn: CheckedIn,
        InheritanceTriggered: InheritanceTriggered,
        YieldClaimed: YieldClaimed
    }

    #[derive(Drop, starknet::Event)]
    struct VaultCreated {
        owner: ContractAddress,
        beneficiary: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct Deposited {
        owner: ContractAddress,
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct Withdrawn {
        owner: ContractAddress,
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct CheckedIn {
        owner: ContractAddress,
        timestamp: u64,
        new_deadline: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct InheritanceTriggered {
        owner: ContractAddress,
        beneficiary: ContractAddress,
        timestamp: u64,
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct YieldClaimed {
        owner: ContractAddress,
        timestamp: u64,
        amount: u256,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        token_address: ContractAddress,
    ) {
        self.token_address.write(token_address);
    }

    #[abi(embed_v0)]
    impl GhostVaultImpl of IGhostVault<ContractState> {
        
        fn create_vault(ref self: ContractState, beneficiary: ContractAddress, period: u64, window_duration: u64) {
            let caller = get_caller_address();
            let mut vault = self.vaults.read(caller);
            assert(!vault.is_active, 'Vault already exists');
            assert(period > 0, 'Period must be > 0');

            let new_vault = Vault {
                beneficiary,
                principal: 0,
                deadline: get_block_timestamp() + period,
                period,
                window_duration,
                is_active: true,
            };

            self.vaults.write(caller, new_vault);
            self.emit(VaultCreated { owner: caller, beneficiary });
        }

        fn get_vault(self: @ContractState, owner: ContractAddress) -> (ContractAddress, u256, u64, u64, u64) {
            let vault = self.vaults.read(owner);
            if !vault.is_active {
                // Return dummy zeroes if not active
                let zero_addr: ContractAddress = starknet::contract_address_const::<0>();
                return (zero_addr, 0, 0, 0, 0);
            }
            (vault.beneficiary, vault.principal, vault.deadline, vault.period, vault.window_duration)
        }

        fn deposit(ref self: ContractState, amount: u256) {
            let caller = get_caller_address();
            let mut vault = self.vaults.read(caller);
            assert(vault.is_active, 'Vault does not exist');
            
            let token_address = self.token_address.read();
            let erc20 = IERC20Dispatcher { contract_address: token_address };
            
            // Transfer tokens from caller to this contract
            erc20.transfer_from(caller, get_contract_address(), amount);
            
            vault.principal += amount;
            self.vaults.write(caller, vault);

            self.emit(Deposited { owner: caller, amount });
        }

        fn withdraw(ref self: ContractState, amount: u256) {
            let caller = get_caller_address();
            let mut vault = self.vaults.read(caller);
            assert(vault.is_active, 'Vault does not exist');
            assert(vault.principal >= amount, 'Insufficient principal');
            
            let token_address = self.token_address.read();
            let erc20 = IERC20Dispatcher { contract_address: token_address };
            
            vault.principal -= amount;
            self.vaults.write(caller, vault);

            erc20.transfer(caller, amount);

            self.emit(Withdrawn { owner: caller, amount });
        }

        fn checkin(ref self: ContractState) {
            let caller = get_caller_address();
            let mut vault = self.vaults.read(caller);
            assert(vault.is_active, 'Vault does not exist');

            let now = get_block_timestamp();
            // allow checkin anytime for simplicity or restrict by window
            let mut window_open = 0;
            if vault.deadline > vault.window_duration {
                window_open = vault.deadline - vault.window_duration;
            }

            // We relax the check-in window constraint to prevent users from being locked out easily in hackathon
            // assert(now >= window_open, 'Check-in window not open yet');
            assert(now <= vault.deadline, 'Deadline has passed');

            vault.deadline = now + vault.period;
            self.vaults.write(caller, vault);

            self.emit(CheckedIn { owner: caller, timestamp: now, new_deadline: vault.deadline });
        }

        fn claim_yield(ref self: ContractState) {
            let caller = get_caller_address();
            let vault = self.vaults.read(caller);
            assert(vault.is_active, 'Vault does not exist');

            let token_address = self.token_address.read();
            let erc20 = IERC20Dispatcher { contract_address: token_address };
            let balance = erc20.balance_of(get_contract_address());
            
            // In a real protocol, yield is accrued proportionally.
            // For hackathon mock, we give owner any excess balance on contract above principal (if any exists).
            // Actually, to make it safe for multi-user, this simplistic yield logic doesn't work well 
            // since one user could drain all yield. We will emit an event and pretend for now as Endur is not integrated.
            let dummy_yield: u256 = 10000; // Mock 0.00000000000001
            
            self.emit(YieldClaimed { owner: caller, timestamp: get_block_timestamp(), amount: dummy_yield });
        }

        fn trigger_inheritance(ref self: ContractState, owner: ContractAddress) {
            let mut vault = self.vaults.read(owner);
            assert(vault.is_active, 'Vault does not exist');
            
            let now = get_block_timestamp();
            assert(now > vault.deadline, 'Deadline not passed yet');
            assert(vault.principal > 0, 'No assets to transfer');

            let token_address = self.token_address.read();
            let erc20 = IERC20Dispatcher { contract_address: token_address };
            
            let amount_to_transfer = vault.principal;
            vault.principal = 0;
            vault.is_active = false; // Close vault
            self.vaults.write(owner, vault);

            // Transfer assets to beneficiary
            erc20.transfer(vault.beneficiary, amount_to_transfer);

            self.emit(InheritanceTriggered { owner, beneficiary: vault.beneficiary, timestamp: now, amount: amount_to_transfer });
        }
    }
}
