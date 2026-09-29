import { describe, expect, test } from "bun:test";
import { withFreshSignIn } from "./fresh-sign-in";

const ok = () => new Response(JSON.stringify({ data: {} }), { status: 200 });
const stale = () => new Response(JSON.stringify({ error: "stale_signature" }), { status: 401 });
const unauthorized = () => new Response(JSON.stringify({ error: "Invalid or expired token" }), { status: 401 });

function harness(responses: Response[], signedIn: string | null = "fresh-token") {
  const tokensUsed: (string | null)[] = [];
  let signIns = 0;
  const queue = [...responses];
  return {
    tokensUsed,
    signIns: () => signIns,
    run: () =>
      withFreshSignIn(
        async (token) => {
          tokensUsed.push(token);
          return queue.shift()!;
        },
        { getToken: () => "stored-token", signIn: async () => { signIns++; return signedIn; } },
      ),
  };
}

describe("doing something sensitive that needs a recent sign-in", () => {
  test("a stored sign-in that is recent enough is used as it is, with no prompt", async () => {
    const h = harness([ok()]);
    expect((await h.run()).status).toBe(200);
    expect(h.tokensUsed).toEqual(["stored-token"]);
    expect(h.signIns()).toBe(0);
  });

  test("when the server says the sign-in is too old, it asks for a fresh one and tries again", async () => {
    const h = harness([stale(), ok()]);
    expect((await h.run()).status).toBe(200);
    expect(h.tokensUsed).toEqual(["stored-token", "fresh-token"]);
    expect(h.signIns()).toBe(1);
  });

  test("any other 401 is not retried, because a new sign-in would not help", async () => {
    const h = harness([unauthorized()]);
    expect((await h.run()).status).toBe(401);
    expect(h.signIns()).toBe(0);
    expect(h.tokensUsed).toHaveLength(1);
  });

  test("it retries only once, so it can never loop", async () => {
    const h = harness([stale(), stale()]);
    expect((await h.run()).status).toBe(401);
    expect(h.signIns()).toBe(1);
    expect(h.tokensUsed).toHaveLength(2);
  });

  test("if the person does not complete the sign-in, the first answer stands", async () => {
    const h = harness([stale()], null);
    expect((await h.run()).status).toBe(401);
    expect(h.tokensUsed).toHaveLength(1);
  });

  test("the response body can still be read after it was checked", async () => {
    const h = harness([stale(), ok()]);
    const res = await h.run();
    expect(await res.json()).toEqual({ data: {} });
  });
});
