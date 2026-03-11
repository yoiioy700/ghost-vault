const { Provider, Contract } = require('starknet');

async function main() {
  const sepoliaProvider = new Provider({ nodeUrl: "https://starknet-sepolia.public.cartridge.gg" });
  
  const tokenAddr = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
  
  const { abi } = await sepoliaProvider.getClassAt(tokenAddr);
  console.log("ABI balanceOf definition:");
  const balDef = abi.find(x => x.name === "balanceOf");
  console.log(JSON.stringify(balDef, null, 2));
  
  const contract = new Contract(abi, tokenAddr, sepoliaProvider);
  
  const account = "0x00609b552E463d1AEEA7E815F89Be9755FBA930C8eb06F92B3E1Aa36C95428c2"; 
  
  try {
     const res = await contract.balanceOf(account);
     console.log("Balance:", res);
  } catch (e) {
     console.error("Error reading balance:", e.message);
  }
}

main();
