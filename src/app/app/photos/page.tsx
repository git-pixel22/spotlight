import { PhotoDump } from "./photo-dump";

export default function PhotosPage() {
  return (
    <div>
      <h1 className="font-heading text-4xl">Drop this week&apos;s photos</h1>
      <p className="mt-1 text-muted">
        Everything from your camera roll, messy ones included. Spotlight picks the moments worth sharing and asks you one question about each.
      </p>
      <PhotoDump />
    </div>
  );
}
