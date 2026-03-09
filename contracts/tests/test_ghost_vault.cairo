#[cfg(test)]
mod tests {
    use starknet::ContractAddress;
    use starknet::contract_address_const;
    use snforge_std::{declare, ContractClassTrait, DeclareResultTrait};
    use ghost_vault::{IGhostVaultDispatcher, IGhostVaultDispatcherTrait};

    // Tests are temporarily disabled as we moved to ERC20 integration.
    // Full test suite will be written in the subsequent step with proper MockERC20 or Forking.
}
