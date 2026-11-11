"use client";

export function DeleteData() {
  return (
    <form
      action="/api/account/delete"
      method="post"
      onSubmit={(e) => {
        if (!confirm("Delete everything Spotlight stores about you? Posts already in Buffer stay in Buffer.")) e.preventDefault();
      }}
      className="mx-auto mt-16 max-w-xl border-t border-line pt-6 text-sm text-muted"
    >
      <p>
        Spotlight stores your profile summary, your photos and your moments. You can delete all of it at any time. Posts you
        already sent stay in Buffer.
      </p>
      <button className="mt-3 font-semibold text-danger underline-offset-4 hover:underline">Delete my data</button>
    </form>
  );
}
