const { RpcProvider } = require("starknet");

async function main() {
  const provider = new RpcProvider({ nodeUrl: "https://api.cartridge.gg/x/starknet/sepolia" });
  
  try {
    const res = await provider.getEvents({
      address: "0x0315fb4e47f77a02df237a55538e35cfdafb2b32920e9b942fbcd3791f18e0c4",
      from_block: { block_number: 170000 },
      to_block: "latest",
      keys: [[]],
      chunk_size: 100
    });
    console.log("Found res:", res.events.length);
    console.log("Sample:", res.events[0]);
  } catch(e) {
    console.log("Error:", e.message);
  }
}
main();
