const { RpcProvider, Contract, num } = require("starknet");

const RPC_URL = process.env.STARKNET_RPC_URL || "https://rpc.starknet.lava.build";
const COLLECTION_ADDRESS = "0x05e73b7be06d82beeb390a0e0d655f2c9e7cf519658e04f05d9c690ccc41da03";

const abi = [
    {
        "name": "get_collection_stats",
        "type": "function",
        "inputs": [
            {
                "name": "collection_id",
                "type": "core::integer::u256"
            }
        ],
        "outputs": [
            {
                "type": "ip_collection_erc_721::types::CollectionStats"
            }
        ],
        "state_mutability": "view"
    },
    {
        "name": "ip_collection_erc_721::types::CollectionStats",
        "type": "struct",
        "members": [
            {
                "name": "total_minted",
                "type": "core::integer::u256"
            },
            {
                "name": "total_burned",
                "type": "core::integer::u256"
            },
            {
                "name": "total_supply",
                "type": "core::integer::u256"
            }
        ]
    },
    {
        "name": "core::integer::u256",
        "type": "struct",
        "members": [
            {
                "name": "low",
                "type": "core::integer::u128"
            },
            {
                "name": "high",
                "type": "core::integer::u128"
            }
        ]
    }
];

async function main() {
    const provider = new RpcProvider({ nodeUrl: RPC_URL });
    const contract = new Contract(abi, COLLECTION_ADDRESS, provider);

    console.log("Fetching stats for collection 1...");
    try {
        const START_ID = 1;
        const stats = await contract.get_collection_stats(START_ID, { blockIdentifier: "latest" });

        console.log("Stats Raw:", stats);
        console.log("Total Minted:", stats.total_minted.low ? stats.total_minted.low : stats.total_minted);

    } catch (e) {
        console.error("Error fetching stats:", e);
    }
}

main();
