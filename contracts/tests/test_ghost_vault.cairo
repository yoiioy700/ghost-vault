#[cfg(test)]
mod tests {
    use starknet::ContractAddress;
    use starknet::contract_address_const;
    use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address, stop_cheat_caller_address, start_cheat_block_timestamp, stop_cheat_block_timestamp, mock_call};
    use ghost_vault::{IGhostVaultDispatcher, IGhostVaultDispatcherTrait};

    fn deploy_ghost_vault() -> (IGhostVaultDispatcher, ContractAddress, ContractAddress) {
        let token_address = contract_address_const::<0x123>();
        let owner = contract_address_const::<0x456>();
        let beneficiary = contract_address_const::<0x789>();

        let contract = declare("GhostVault").unwrap().contract_class();
        let mut calldata = array![token_address.into()];
        let (contract_address, _) = contract.deploy(@calldata).unwrap();

        (IGhostVaultDispatcher { contract_address }, owner, beneficiary)
    }

    #[test]
    fn test_create_vault() {
        let (contract, owner, beneficiary) = deploy_ghost_vault();
        
        start_cheat_caller_address(contract.contract_address, owner);
        contract.create_vault(beneficiary, 86400 * 30, 86400 * 7);
        
        let (ret_beneficiary, principal, deadline, period, window) = contract.get_vault(owner);
        assert(ret_beneficiary == beneficiary, 'Wrong beneficiary');
        assert(principal == 0, 'Principal should be 0');
        assert(period == 86400 * 30, 'Wrong period');
        
        stop_cheat_caller_address(contract.contract_address);
    }

    #[test]
    #[should_panic(expected: 'Vault already exists')]
    fn test_create_vault_twice_fails() {
        let (contract, owner, beneficiary) = deploy_ghost_vault();
        
        start_cheat_caller_address(contract.contract_address, owner);
        contract.create_vault(beneficiary, 86400 * 30, 86400 * 7);
        contract.create_vault(beneficiary, 86400 * 30, 86400 * 7); // Should panic
    }

    #[test]
    fn test_deposit_success() {
        let (contract, owner, beneficiary) = deploy_ghost_vault();
        let token_address = contract_address_const::<0x123>();

        // Mock ERC20 transfer_from to return true
        mock_call(token_address, selector!("transfer_from"), array![1], 1);

        start_cheat_caller_address(contract.contract_address, owner);
        contract.create_vault(beneficiary, 86400 * 30, 86400 * 7);
        contract.deposit(1000);
        
        let (_, principal, _, _, _) = contract.get_vault(owner);
        assert(principal == 1000, 'Principal should be 1000');
    }

    #[test]
    fn test_withdraw_success() {
        let (contract, owner, beneficiary) = deploy_ghost_vault();
        let token_address = contract_address_const::<0x123>();

        mock_call(token_address, selector!("transfer_from"), array![1], 1);
        mock_call(token_address, selector!("transfer"), array![1], 1);

        start_cheat_caller_address(contract.contract_address, owner);
        contract.create_vault(beneficiary, 86400 * 30, 86400 * 7);
        contract.deposit(1000);
        contract.withdraw(500);
        
        let (_, principal, _, _, _) = contract.get_vault(owner);
        assert(principal == 500, 'Principal should be 500');
    }

    #[test]
    #[should_panic(expected: 'Insufficient principal')]
    fn test_withdraw_fail_insufficient() {
        let (contract, owner, beneficiary) = deploy_ghost_vault();
        let token_address = contract_address_const::<0x123>();

        mock_call(token_address, selector!("transfer_from"), array![1], 1);

        start_cheat_caller_address(contract.contract_address, owner);
        contract.create_vault(beneficiary, 86400 * 30, 86400 * 7);
        contract.deposit(1000);
        contract.withdraw(2000); // Should panic
    }

    #[test]
    fn test_checkin_success() {
        let (contract, owner, beneficiary) = deploy_ghost_vault();
        
        start_cheat_block_timestamp(contract.contract_address, 1000); // Day 0
        start_cheat_caller_address(contract.contract_address, owner);
        contract.create_vault(beneficiary, 86400 * 30, 86400 * 7);
        
        let checkin_time: u64 = 1000 + 86400 * 15; // Day 15
        start_cheat_block_timestamp(contract.contract_address, checkin_time);
        
        contract.checkin();
        let (_, _, deadline, _, _) = contract.get_vault(owner);
        assert(deadline == checkin_time + 86400 * 30, 'New deadline wrong');
    }

    #[test]
    #[should_panic(expected: 'Deadline has passed')]
    fn test_checkin_fail_too_late() {
        let (contract, owner, beneficiary) = deploy_ghost_vault();
        
        start_cheat_block_timestamp(contract.contract_address, 1000); // Day 0
        start_cheat_caller_address(contract.contract_address, owner);
        contract.create_vault(beneficiary, 86400 * 30, 86400 * 7);
        
        let checkin_time: u64 = 1000 + 86400 * 31; // Day 31 (Too late!)
        start_cheat_block_timestamp(contract.contract_address, checkin_time);
        
        contract.checkin(); // Should panic
    }

    #[test]
    fn test_trigger_inheritance_success() {
        let (contract, owner, beneficiary) = deploy_ghost_vault();
        let token_address = contract_address_const::<0x123>();

        mock_call(token_address, selector!("transfer_from"), array![1], 1);
        mock_call(token_address, selector!("transfer"), array![1], 1);
        mock_call(token_address, selector!("balance_of"), array![1000], 1);

        start_cheat_block_timestamp(contract.contract_address, 1000); // Day 0
        start_cheat_caller_address(contract.contract_address, owner);
        contract.create_vault(beneficiary, 86400 * 30, 86400 * 7);
        contract.deposit(1000);
        stop_cheat_caller_address(contract.contract_address);

        let trigger_time: u64 = 1000 + 86400 * 35; // Day 35 (Past deadline)
        start_cheat_block_timestamp(contract.contract_address, trigger_time);
        
        contract.trigger_inheritance(owner);
        let (_, principal, _, _, _) = contract.get_vault(owner);
        assert(principal == 0, 'Principal not drained');
    }

    #[test]
    #[should_panic(expected: 'Deadline not passed yet')]
    fn test_trigger_inheritance_fail_early() {
        let (contract, owner, beneficiary) = deploy_ghost_vault();
        let token_address = contract_address_const::<0x123>();

        mock_call(token_address, selector!("transfer_from"), array![1], 1);

        start_cheat_block_timestamp(contract.contract_address, 1000); // Day 0
        start_cheat_caller_address(contract.contract_address, owner);
        contract.create_vault(beneficiary, 86400 * 30, 86400 * 7);
        contract.deposit(1000);
        stop_cheat_caller_address(contract.contract_address);

        let trigger_time: u64 = 1000 + 86400 * 20; // Day 20 (Early)
        start_cheat_block_timestamp(contract.contract_address, trigger_time);
        
        contract.trigger_inheritance(owner); // Should panic
    }
}
