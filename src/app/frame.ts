/**
 * The app lives in one frame (PhoneFrame). On a phone that frame is the
 * screen; on anything wider it is a centred column at the mobile width.
 * Nothing the app draws may escape it, so:
 *
 * - the frame is the containing block for every fixed layer and clips them
 *   (`contain: layout paint` on #hl-frame), so `fixed inset-0` means "fill the
 *   frame", never "fill the window";
 * - portalled layers go into the frame, not <body>;
 * - anything measured is measured off the frame, not the viewport.
 */
export const FRAME_ID = 'hl-frame'

/** Where overlays are portalled to: the frame (body only before it has mounted). */
export function frameLayer(): HTMLElement {
  return document.getElementById(FRAME_ID) ?? document.body
}

/** The frame's box in viewport coordinates. */
export function frameRect(): DOMRect {
  const el = document.getElementById(FRAME_ID)
  return el ? el.getBoundingClientRect() : new DOMRect(0, 0, window.innerWidth, window.innerHeight)
}
