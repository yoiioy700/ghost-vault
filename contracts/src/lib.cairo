#[starknet::interface]
pub trait IGhostVault<TContractState> {
    fn get_vault_status(self: @TContractState) -> (u256, u64); // returns (principal, deadline)
    fn deposit(ref self: TContractState, amount: u256);
    fn checkin(ref self: TContractState);
    fn claim_yield(ref self: TContractState);
    fn trigger_inheritance(ref self: TContractState);
}

#[starknet::contract]
mod GhostVault {
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::get_block_timestamp;
    use super::IGhostVault;

    #[storage]
    struct Storage {
        owner: ContractAddress,
        beneficiary: ContractAddress,
        /// The amount of principal deposited
        principal: u256,
        /// The timestamp when the vault inheritance is triggered
        deadline: u64,
        /// The period in seconds between check-ins (e.g. 30 days)
        period: u64,
        /// The time remaining before deadline when the checkin window opens (e.g. 7 days)
        window_duration: u64,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Deposited: Deposited,
        CheckedIn: CheckedIn,
        InheritanceTriggered: InheritanceTriggered,
        YieldClaimed: YieldClaimed
    }

    #[derive(Drop, starknet::Event)]
    struct Deposited {
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct CheckedIn {
        timestamp: u64,
        new_deadline: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct InheritanceTriggered {
        timestamp: u64,
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct YieldClaimed {
        timestamp: u64,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        beneficiary: ContractAddress,
        period: u64,
        window_duration: u64,
    ) {
        self.owner.write(owner);
        self.beneficiary.write(beneficiary);
        self.principal.write(0);
        self.period.write(period);
        self.window_duration.write(window_duration);
        self.deadline.write(get_block_timestamp() + period);
    }

    #[abi(embed_v0)]
    impl GhostVaultImpl of IGhostVault<ContractState> {
        fn get_vault_status(self: @ContractState) -> (u256, u64) {
            (self.principal.read(), self.deadline.read())
        }

        fn deposit(ref self: ContractState, amount: u256) {
            let caller = get_caller_address();
            assert(caller == self.owner.read(), 'Only owner can deposit');
            
            // For MVP: Mocking the deposit logic
            // In a real implementation we would transfer BTC from caller
            // and then deposit it into Endur.fi xBTC contract
            
            let current_principal = self.principal.read();
            self.principal.write(current_principal + amount);

            self.emit(Deposited { amount });
        }

        fn checkin(ref self: ContractState) {
            let caller = get_caller_address();
            assert(caller == self.owner.read(), 'Only owner can check-in');

            let now = get_block_timestamp();
            let deadline = self.deadline.read();
            let window_open = deadline - self.window_duration.read();

            assert(now >= window_open, 'Check-in window not open yet');
            assert(now <= deadline, 'Deadline has passed');

            let new_deadline = now + self.period.read();
            self.deadline.write(new_deadline);

            self.emit(CheckedIn { timestamp: now, new_deadline });
        }

        fn claim_yield(ref self: ContractState) {
            let caller = get_caller_address();
            assert(caller == self.owner.read(), 'Only owner can claim yield');

            // For MVP: Mocking yield claim
            let now = get_block_timestamp();
            self.emit(YieldClaimed { timestamp: now });
        }

        fn trigger_inheritance(ref self: ContractState) {
            let now = get_block_timestamp();
            let deadline = self.deadline.read();

            assert(now > deadline, 'Deadline not passed yet');
            assert(self.principal.read() > 0, 'No assets to transfer');

            // For MVP: Mocking inheritance logic
            // In a real implementation we would unstake xBTC -> BTC
            // Calculate total yield and send 100% to beneficiary.

            let total_transfer_mock = self.principal.read();
            self.principal.write(0);

            self.emit(InheritanceTriggered { timestamp: now, amount: total_transfer_mock });
        }
    }
}
