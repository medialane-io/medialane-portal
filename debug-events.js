const { RpcProvider } = require("starknet");

const RPC_URL = process.env.STARKNET_RPC_URL || "https://rpc.starknet.lava.build";
const COLLECTION_ADDRESS = "0x05e73b7be06d82beeb390a0e0d655f2c9e7cf519658e04f05d9c690ccc41da03";
const COLLECTION_CREATED_SELECTOR = "0xfca650bfd622aeae91aa1471499a054e4c7d3f0d75fbcb98bdb3bbb0358b0c";
// From .env.local
const START_BLOCK = 6204232;

async function main() {
    const provider = new RpcProvider({ nodeUrl: RPC_URL });

    console.log("Fetching events...");
    try {
        const response = await provider.getEvents({
            address: COLLECTION_ADDRESS,
            keys: [[COLLECTION_CREATED_SELECTOR]],
            from_block: { block_number: START_BLOCK },
            chunk_size: 10
        });

        console.log("Events found:", response.events.length);
        if (response.events.length > 0) {
            console.log("First event:", response.events[0]);
        }
    } catch (e) {
        console.error("Error fetching events:", e);
    }
}

main();
