import { describe, expect, test } from "bun:test";
import { MissingFilesError } from "./engine";
import { filesUploadStep } from "./steps";

const artwork = new File(["a"], "a.png", { type: "image/png" });
const cover = new File(["c"], "cover.png", { type: "image/png" });

function uploader(files: Map<string, File>) {
  const calls: string[] = [];
  const events: { name: string; done: number; total: number }[] = [];
  const step = filesUploadStep({
    files,
    client: {
      uploadUrl: async (_id, name) => (calls.push(`url:${name}`), `https://upload/${name}`),
      uploaded: async (_id, name, cid) => (calls.push(`uploaded:${name}:${cid}`), {}),
    },
    putFile: async (url, file) => (calls.push(`put:${url}:${file.name}`), `cid-${file.name}`),
    emit: ({ name, done, total }) => events.push({ name, done, total }),
  });
  return { step, calls, events };
}

describe("filesUploadStep", () => {
  test("uploads each requested file from the map, in order", async () => {
    const { step, calls, events } = uploader(new Map([["a.png", artwork], ["cover.png", cover]]));
    await step({ files: ["a.png", "cover.png"] }, "run1");
    expect(calls).toEqual([
      "url:a.png",
      "put:https://upload/a.png:a.png",
      "uploaded:a.png:cid-a.png",
      "url:cover.png",
      "put:https://upload/cover.png:cover.png",
      "uploaded:cover.png:cid-cover.png",
    ]);
    expect(events).toEqual([
      { name: "a.png", done: 0, total: 2 },
      { name: "cover.png", done: 1, total: 2 },
    ]);
  });

  test("asks for every requested file that is not attached, before uploading any", async () => {
    const { step, calls } = uploader(new Map([["a.png", artwork]]));
    const error = await step({ files: ["a.png", "cover.png"] }, "run1").catch((e) => e);
    expect(error).toBeInstanceOf(MissingFilesError);
    expect((error as MissingFilesError).files).toEqual(["cover.png"]);
    expect(calls).toEqual([]);
  });
});
