// Generates demo narration with Gemini text-to-speech (free tier).
// usage: node scripts/tts.mjs <outDir> <voiceName> <style> <name=text>...
import { mkdirSync, writeFileSync } from "node:fs";

const [, , outDir, voice, style, ...lines] = process.argv;
mkdirSync(outDir, { recursive: true });

function wavFromPcm(pcm, rate = 24000) {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

for (const line of lines) {
  const [name, ...rest] = line.split("=");
  const text = rest.join("=");
  // Free tier allows only a few requests a minute: back off and retry on quota errors.
  let json;
  for (let attempt = 0; attempt < 4; attempt++) {
    const model = process.env.TTS_MODEL ?? "gemini-3.8-flash-tts";
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": process.env.GEMINI_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: style ? `${style}: ${text}` : text }] }],
        generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } },
      }),
    });
    json = await res.json();
    if (res.status !== 429) break;
    console.log(name, "rate limited, retrying in 40s");
    await new Promise((r) => setTimeout(r, 40000));
  }
  const part = json.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  if (!part) {
    console.log(name, "FAILED", json.error?.message?.slice(0, 160));
    continue;
  }
  const data = Buffer.from(part.data, "base64");
  const isWav = data.subarray(0, 4).toString() === "RIFF";
  const rate = Number(/rate=(\d+)/.exec(part.mimeType)?.[1] ?? 24000);
  writeFileSync(`${outDir}/${name}.wav`, isWav ? data : wavFromPcm(data, rate));
  console.log(name, "ok", part.mimeType);
  await new Promise((r) => setTimeout(r, Number(process.env.TTS_GAP_MS ?? 1500)));
}
