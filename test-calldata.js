const { CallData, byteArray } = require("starknet");

function test() {
    console.log("Testing ByteArray serialization...");

    const name = "Agent Production Test";
    const symbol = "APROD";
    const baseUri = "ipfs://test";

    const nameBA = byteArray.byteArrayFromString(name);
    const symbolBA = byteArray.byteArrayFromString(symbol);
    const baseUriBA = byteArray.byteArrayFromString(baseUri);

    console.log("nameBA structure:", JSON.stringify(nameBA, null, 2));

    try {
        const compiled = CallData.compile([nameBA, symbolBA, baseUriBA]);
        console.log("Compiled Felt Array:", JSON.stringify(compiled, null, 2));
    } catch (e) {
        console.error("Compilation failed:", e.message);
    }
}

test();
