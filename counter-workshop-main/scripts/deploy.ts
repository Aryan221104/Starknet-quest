import { Account, CallData, Contract, RpcProvider, stark } from "starknet";
import * as dotenv from "dotenv";
import { getCompiledCode } from "./utils";
dotenv.config();

async function main() {
  const provider = new RpcProvider({
    nodeUrl: "https://starknet-sepolia.public.blastapi.io/rpc/v0_7",
  });

  // initialize existing predeployed account 0
  console.log("ACCOUNT_ADDRESS=", 0x014AA09Ac6256281fFE623Aa2Fa9F2AB06b81407811E2D05A385C3296882e19D);
  console.log("ACCOUNT_PRIVATE_KEY=", 0x0450e55d5b25470039b95c0b4b8f9e13fd63132624d5509e43659915a5e06bdf);
  const privateKey0 ="0x0450e55d5b25470039b95c0b4b8f9e13fd63132624d5509e43659915a5e06bdf";
  const accountAddress0: string = "0x014AA09Ac6256281fFE623Aa2Fa9F2AB06b81407811E2D05A385C3296882e19D";
  const account0 = new Account(provider, accountAddress0, privateKey0);
  console.log("Account connected.\n");

  // Declare & deploy contract
  let sierraCode, casmCode;

  try {
    ({ sierraCode, casmCode } = await getCompiledCode("workshop_Counter"));
  } catch (error: any) {
    console.log("Failed to read contract files");
    process.exit(1);
  }

  const myCallData = new CallData(sierraCode.abi);
  const constructor = myCallData.compile("constructor", {
    counter: 100,
    kill_switch:
      "0x05f7151ea24624e12dde7e1307f9048073196644aa54d74a9c579a257214b542",
    initial_owner: "0x014AA09Ac6256281fFE623Aa2Fa9F2AB06b81407811E2D05A385C3296882e19D",
  });
  const deployResponse = await account0.declareAndDeploy({
    contract: sierraCode,
    casm: casmCode,
    constructorCalldata: constructor,
    salt: stark.randomAddress(),
  });

  // Connect the new contract instance :
  const myTestContract = new Contract(
    sierraCode.abi,
    deployResponse.deploy.contract_address,
    provider
  );
  console.log(
    `✅ Contract has been deploy with the address: ${myTestContract.address}`
  );
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
