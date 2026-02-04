import { useEffect, useMemo, useState } from "react";
import { logEvent } from "./logger";

type GiftId = 1 | 2 | 3 | 4;

export function CelebrationOverlay({
  gift,
  onDone,
  durationMs = 3000,
}: {
  gift: GiftId;
  onDone: () => void;
  durationMs?: number;
}) {
  const [fadeOut, setFadeOut] = useState(false);

  const imgSrc = useMemo(() => {
    // Put these files:
    // src/assets/gift1/reveal.jpg
    // src/assets/gift2/reveal.jpg
    // src/assets/gift3/reveal.jpg
    // src/assets/gift4/reveal.jpg
    return new URL(`./assets/gift${gift}/reveal.jpeg`, import.meta.url).toString();
  }, [gift]);

  useEffect(() => {
    logEvent("celebration_overlay_shown", { gift });

    // Start fade a bit before removal
    const fadeTimer = window.setTimeout(() => setFadeOut(true), Math.max(0, durationMs - 450));
    const doneTimer = window.setTimeout(() => {
      logEvent("celebration_overlay_hidden", { gift });
      onDone();
    }, durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [gift, durationMs, onDone]);

  return (
    <div className={`celebrateOverlay ${fadeOut ? "out" : ""}`} role="presentation" aria-hidden="true">
      <div className="celebrateInner">
        <img className="celebrateImg" src={imgSrc} alt={`gift ${gift}`} />
        <div className="celebrateBadge">Unlocked ✨</div>
      </div>
    </div>
  );
}