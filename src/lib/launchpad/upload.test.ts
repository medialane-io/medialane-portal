import { describe, expect, test } from "bun:test";
import { putFileToSignedUrl } from "./upload";

const file = (name: string) => new File(["x"], name, { type: "application/pdf" });

describe("putFileToSignedUrl", () => {
  test("posts the file to the signed URL and returns the pinned CID", async () => {
    let sent: FormData | null = null;
    const fetchImpl = (async (_url: string, init?: RequestInit) => {
      sent = init?.body as FormData;
      return new Response(JSON.stringify({ data: { cid: "bafy123" } }), { status: 200 });
    }) as unknown as typeof fetch;
    expect(await putFileToSignedUrl("https://upload", file("a.pdf"), fetchImpl)).toBe("bafy123");
    expect((sent!.get("file") as File).name).toBe("a.pdf");
    expect(sent!.get("network")).toBe("public");
  });

  test("an upload without a CID is an error", async () => {
    const fetchImpl = (async () => new Response("{}", { status: 200 })) as unknown as typeof fetch;
    await expect(putFileToSignedUrl("https://upload", file("a.pdf"), fetchImpl)).rejects.toThrow();
  });
});
