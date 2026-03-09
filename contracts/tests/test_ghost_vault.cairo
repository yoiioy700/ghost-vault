#[cfg(test)]
mod tests {
    use starknet::ContractAddress;
    use starknet::contract_address_const;
    use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address, stop_cheat_caller_address, start_cheat_block_timestamp, stop_cheat_block_timestamp};
    use ghost_vault::IGhostVaultDispatcher;
    use ghost_vault::IGhostVaultDispatcherTrait;

    fn deploy_ghost_vault() -> (IGhostVaultDispatcher, ContractAddress, ContractAddress) {
        let owner = contract_address_const::<'owner'>();
        let beneficiary = contract_address_const::<'beneficiary'>();
        let period: u64 = 86400 * 30; // 30 days
        let window_duration: u64 = 86400 * 7; // 7 days

        let contract = declare("GhostVault").unwrap().contract_class();
        let mut calldata = array![
            owner.into(),
            beneficiary.into(),
            period.into(),
            window_duration.into()
        ];
        let (contract_address, _) = contract.deploy(@calldata).unwrap();
        
        (IGhostVaultDispatcher { contract_address }, owner, beneficiary)
    }

    #[test]
    fn test_deposit_and_status() {
        let (contract, owner, _) = deploy_ghost_vault();
        
        start_cheat_caller_address(contract.contract_address, owner);
        contract.deposit(1000);
        stop_cheat_caller_address(contract.contract_address);

        let (principal, deadline) = contract.get_vault_status();
        assert(principal == 1000, 'Principal should be 1000');
        // Initial deadline should be block_timestamp (0) + 30 days
        let expected_deadline: u64 = 86400 * 30;
        assert(deadline == expected_deadline, 'Deadline is incorrect');
    }

    #[test]
    fn test_checkin_success() {
        let (contract, owner, _) = deploy_ghost_vault();
        
        // Fast forward time to within the 7-day window before deadline
        // Deadline is day 30. Window opens at day 23.
        let checkin_time: u64 = 86400 * 25; // day 25
        start_cheat_block_timestamp(contract.contract_address, checkin_time);
        
        start_cheat_caller_address(contract.contract_address, owner);
        contract.checkin();
        stop_cheat_caller_address(contract.contract_address);
        stop_cheat_block_timestamp(contract.contract_address);

        let (_, deadline) = contract.get_vault_status();
        // New deadline should be checkin_time + 30 days
        let expected_deadline: u64 = checkin_time + (86400 * 30);
        assert(deadline == expected_deadline, 'Deadline not updated');
    }

    #[test]
    #[should_panic(expected: 'Check-in window not open yet')]
    fn test_checkin_fail_too_early() {
        let (contract, owner, _) = deploy_ghost_vault();
        
        // Fast forward time but NOT within the window
        // Deadline is day 30. Window opens at day 23.
        let checkin_time: u64 = 86400 * 10; // day 10
        start_cheat_block_timestamp(contract.contract_address, checkin_time);
        
        start_cheat_caller_address(contract.contract_address, owner);
        contract.checkin();
    }

    #[test]
    #[should_panic(expected: 'Deadline has passed')]
    fn test_checkin_fail_too_late() {
        let (contract, owner, _) = deploy_ghost_vault();
        
        // Fast forward time past deadline
        let checkin_time: u64 = 86400 * 31; // day 31
        start_cheat_block_timestamp(contract.contract_address, checkin_time);
        
        start_cheat_caller_address(contract.contract_address, owner);
        contract.checkin();
    }

    #[test]
    fn test_trigger_inheritance_success() {
        let (contract, owner, _beneficiary) = deploy_ghost_vault();
        
        start_cheat_caller_address(contract.contract_address, owner);
        contract.deposit(1000);
        stop_cheat_caller_address(contract.contract_address);

        // Fast forward past deadline
        let trigger_time: u64 = 86400 * 35; // day 35
        start_cheat_block_timestamp(contract.contract_address, trigger_time);
        
        contract.trigger_inheritance();
        stop_cheat_block_timestamp(contract.contract_address);

        // Principal should be drained
        let (principal, _) = contract.get_vault_status();
        assert(principal == 0, 'Principal not drained');
    }

    #[test]
    #[should_panic(expected: 'Deadline not passed yet')]
    fn test_trigger_inheritance_fail_early() {
        let (contract, owner, _beneficiary) = deploy_ghost_vault();
        
        start_cheat_caller_address(contract.contract_address, owner);
        contract.deposit(1000);
        stop_cheat_caller_address(contract.contract_address);

        // Try to trigger on day 20, before deadline (day 30)
        let trigger_time: u64 = 86400 * 20; 
        start_cheat_block_timestamp(contract.contract_address, trigger_time);
        
        contract.trigger_inheritance();
    }
}
