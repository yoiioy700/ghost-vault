---
sidebar_position: 3
---

# Smart Contracts (Cairo 1.0)

Ghost Vault operates primarily on a minimalist, gas-efficient design built natively in **Cairo 1.0** for Starknet.

Our philosophy is simple: **Security through simplicity**. 

## The Vault Contract
Every user essentially interacts with an isolated, individual vault. When you instantiate a new Ghost Vault, you deploy a new contract instance specifically tailored to your parameters.

### Constructor & Initialization
The `constructor` function accepts three critical parameters:
1. `owner`: The address of the individual who owns and controls the vault and deposited tokens. 
2. `beneficiary`: The address of the individual who receives the tokens if the vault triggers the switch.
3. `timelock`: The interval period (in seconds) between pings.

### Core Functions

- `ping()`: Can **only** be called by the `owner`. Resets the internal `last_ping` timestamp to the current block timestamp. Reverts if called by anyone else or if the vault is already claimed.
- `claim()`: Can **only** be called by the `beneficiary`. Checks if `current_time > last_ping + timelock`. If true, the accumulated `balance_of(vault_address)` is transferred to the beneficiary.
- `withdraw(amount)`: Can **only** be called by the `owner` to voluntarily remove assets before a time-lock expires, retaining full self-custody over the funds while active.

## Code Standards
All contracts adhere to the official [Cairo 1.0 Guidelines](https://book.cairo-lang.org/) and Starknet conventions. By relying natively on Starknet's generalized `u256` token representation alongside `balance_of` and `transfer` interfaces, we easily support ERC20 tokens like testnet STRK and Mainnet STRK.

## Example ABI Snippet

```json
{
  "name": "ping",
  "type": "function",
  "inputs": [],
  "outputs": [],
  "state_mutability": "external"
}
```
*The full repository holds the detailed ABIs that our frontend natively parses.*
