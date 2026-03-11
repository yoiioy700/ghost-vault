const fetch = require('node-fetch'); // we might not have it, let's use global fetch
const payload = {
    jsonrpc: "2.0",
    method: "starknet_chainId",
    params: [],
    id: 1
};
async function check(url) {
    try {
        const r = await fetch(url, { method: "POST", body: JSON.stringify(payload), headers: {"Content-Type":"application/json"} });
        const data = await r.json();
        console.log("Success with", url, ":", data.result);
    } catch(e) {
        console.log("Failed with", url, ":", e.message);
    }
}
async function run() {
    await check("https://starknet-sepolia.public.cartridge.gg");
    await check("https://free-rpc.nethermind.io/sepolia-juno");
    await check("https://api.cartridge.gg/x/starknet/sepolia");
    await check("https://starknet-sepolia.reddio.com");
}
run();
