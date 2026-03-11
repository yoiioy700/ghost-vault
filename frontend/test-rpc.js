const account = "0x00609b552E463d1AEEA7E815F89Be9755FBA930C8eb06F92B3E1Aa36C95428c2";
const contract = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

const payload = {
    jsonrpc: "2.0",
    method: "starknet_call",
    params: [
        {
            contract_address: contract,
            entry_point_selector: "0x02e4263afad30923c891518314c3c95dbe814a88f3228acab9fec1d7667ffeb8", // balanceOf
            calldata: [account]
        },
        "latest"
    ],
    id: 1
};

fetch("https://free-rpc.nethermind.io/sepolia-juno", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" }
}).then(r => r.json()).then(console.log).catch(console.error);
