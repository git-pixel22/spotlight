/**
 * The real Buffer drafts clip. Drop a recording at public/buffer-clip.mp4 and it replaces the
 * placeholder card in the 2-bar (3.97 s) slot after "Straight into Buffer." Nothing else changes.
 */
export const BUFFER_CLIP = "buffer-clip.mp4";

/** Screen position of the logo's yellow disc in the logo scene; the cold open's three spotlights merge here. */
export const LOGO = { size: 190, gap: 44, left: 441, top: 318, textWidth: 804 };
export const LOGO_DISC = { x: LOGO.left + LOGO.size / 2, y: LOGO.top + LOGO.size / 2, r: (8 / 32) * LOGO.size };
