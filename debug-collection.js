const { RpcProvider, Contract, num } = require("starknet");

const RPC_URL = process.env.STARKNET_RPC_URL || "https://rpc.starknet.lava.build";
const COLLECTION_ADDRESS = "0x05e73b7be06d82beeb390a0e0d655f2c9e7cf519658e04f05d9c690ccc41da03";

const abi = [
    {
        "name": "get_collection",
        "type": "function",
        "inputs": [
            {
                "name": "collection_id",
                "type": "core::integer::u256"
            }
        ],
        "outputs": [
            {
                "type": "ip_collection_erc_721::types::Collection"
            }
        ],
        "state_mutability": "view"
    },
    {
        "name": "ip_collection_erc_721::types::Collection",
        "type": "struct",
        "members": [
            {
                "name": "name",
                "type": "core::byte_array::ByteArray"
            },
            {
                "name": "symbol",
                "type": "core::byte_array::ByteArray"
            },
            {
                "name": "base_uri",
                "type": "core::byte_array::ByteArray"
            },
            {
                "name": "owner",
                "type": "core::starknet::contract_address::ContractAddress"
            },
            {
                "name": "ip_nft",
                "type": "core::starknet::contract_address::ContractAddress"
            },
            {
                "name": "is_active",
                "type": "core::bool"
            }
        ]
    },
    {
        "name": "core::byte_array::ByteArray",
        "type": "struct",
        "members": [
            {
                "name": "data",
                "type": "core::array::Array::<core::bytes_31::bytes31>"
            },
            {
                "name": "pending_word",
                "type": "core::felt252"
            },
            {
                "name": "pending_word_len",
                "type": "core::integer::u32"
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
    },
    {
        "name": "core::bool",
        "type": "enum",
        "variants": [
            {
                "name": "False",
                "type": "()"
            },
            {
                "name": "True",
                "type": "()"
            }
        ]
    }
];

async function main() {
    const provider = new RpcProvider({ nodeUrl: RPC_URL });
    const contract = new Contract(abi, COLLECTION_ADDRESS, provider);

    console.log("Fetching collection 1...");
    try {
        const START_ID = 1;
        const colData = await contract.get_collection(START_ID, { blockIdentifier: "latest" });

        console.log("IP NFT Address (dec):", colData.ip_nft);
        console.log("IP NFT Address (hex):", num.toHex(colData.ip_nft));

    } catch (e) {
        console.error("Error fetching collection:", e);
    }
}

main();
