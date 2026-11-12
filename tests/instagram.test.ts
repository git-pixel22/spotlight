import { test } from "node:test";
import assert from "node:assert/strict";
import { IG_MAX, IG_MIN, instagramCrop } from "@/lib/instagram";

test("images already inside 4:5 to 1.91:1 are left alone", () => {
  for (const [w, h] of [[1080, 1080], [1080, 1350], [1920, 1080], [1910, 1000]]) {
    assert.equal(instagramCrop(w, h), null, `${w}x${h}`);
  }
});

test("a 3:4 phone photo is centre-cropped to 4:5", () => {
  assert.deepEqual(instagramCrop(735, 969), { left: 0, top: 25, width: 735, height: 919 });
});

test("a 9:16 photo is centre-cropped to 4:5", () => {
  const box = instagramCrop(736, 1308)!;
  assert.equal(box.width, 736);
  assert.ok(Math.abs(box.width / box.height - IG_MIN) < 0.005);
  assert.equal(box.top, Math.round((1308 - box.height) / 2));
});

test("a wide panorama is cropped to 1.91:1", () => {
  const box = instagramCrop(3000, 1000)!;
  assert.equal(box.height, 1000);
  assert.ok(Math.abs(box.width / box.height - IG_MAX) < 0.005);
  assert.equal(box.left, Math.round((3000 - box.width) / 2));
});
