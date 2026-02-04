import { useEffect, useMemo, useRef, useState } from "react";
import { premiumConfettiBurst } from "./effects";
import { CelebrationOverlay } from "./CelebrationOverlay";
import "./styles.css";
import { logEvent } from "./logger";

type GiftId = 1 | 2 | 3 | 4;

export default function App() {
  const DEV_CONTROLS = (import.meta.env.VITE_DEV_CONTROLS === "true");
  const name = import.meta.env.VITE_GIRL_NAME || "Bestie";
  const [celebrateGift, setCelebrateGift] = useState<GiftId | null>(null);

  const [introDone, setIntroDone] = useState(false);
  const [unlocked, setUnlocked] = useState<Record<GiftId, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
  });

  const gift2Available = unlocked[1];
  const gift3Available = unlocked[1] && unlocked[2];
  const gift4Available = unlocked[1] && unlocked[2] && unlocked[3];

  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    logEvent("page_view");
    const onUnload = () => logEvent("page_unload");
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, []);

  const progress = useMemo(() => {
    const count = [1, 2, 3, 4].filter((g) => unlocked[g as GiftId]).length;
    return `${count}/4 unlocked`;
  }, [unlocked]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const unlockGift = (gift: GiftId) => {
  setUnlocked((prev) => ({ ...prev, [gift]: true }));
  logEvent("gift_unlocked", { gift });

  // ✅ fire confetti + show image overlay
  premiumConfettiBurst(gift === 4 ? "big" : "medium");
  setCelebrateGift(gift); // overlay auto-hides in 3s
};

  const setGiftUnlocked = (gift: GiftId, value: boolean) => {
  setUnlocked((prev) => {
    const next = { ...prev };

    if (value) {
      // unlock this gift
      next[gift] = true;
    } else {
      // lock this gift and everything after it (keeps gating consistent)
      for (const g of [1, 2, 3, 4] as GiftId[]) {
        if (g >= gift) next[g] = false;
      }
    }

    logEvent("dev_set_gift_unlock", { gift, value, next });
    return next;
  });
};

function DevControls({
  show,
  gift,
  unlocked,
  onUnlock,
  onLock,
}: {
  show: boolean;
  gift: number;
  unlocked: boolean;
  onUnlock: () => void;
  onLock: () => void;
}) {
  if (!show) return null;

  return (
    <div className="devPanel">
      <div className="devTitle">DEV CONTROLS</div>
      <div className="row">
        <button className="btn" onClick={onUnlock}>
          Unlock Gift {gift}
        </button>
        <button className="btn" onClick={onLock}>
          Lock Gift {gift}+
        </button>
        <span className="pill">{unlocked ? "Unlocked ✅" : "Locked 🔒"}</span>
      </div>
    </div>
  );
}

const prevGift3 = useRef(false);

useEffect(() => {
  // Detect the moment it flips from false -> true
  if (!prevGift3.current && unlocked[3]) {
    // small delay so the DOM renders the greedy block first
    setTimeout(() => {
      const el = document.getElementById("gift3-greedy");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        logEvent("gift3_scrolled_to_greedy");
      }
    }, 50);
  }

  prevGift3.current = unlocked[3];
}, [unlocked[3]]);

  return (
    <div className="app" ref={pageRef}>
      {celebrateGift && (
  <CelebrationOverlay
    gift={celebrateGift}
    onDone={() => setCelebrateGift(null)}
    durationMs={3000}
  />
)}
      {!introDone && (
        <Intro
          onDone={() => {
            setIntroDone(true);
            logEvent("intro_done");
            setTimeout(() => scrollTo("hero"), 150);
          }}
        />
      )}

      <Background />

      <section id="hero" className="section hero">
        <div className="glass heroCard">
          <div className="kicker">Happy Birthday</div>
          <h1 className="title">{name} ✨</h1>
          <p className="subtitle">I made you a tiny universe. Unlock it.</p>

          <div className="row">
            <button
              className="btn primary"
              onClick={() => {
                logEvent("hero_start_click");
                scrollTo("roadmap");
              }}
            >
              Start unlocking →
            </button>

            <div className="pill">{progress}</div>
          </div>
        </div>
      </section>

      <section id="roadmap" className="section">
        <div className="glass card">
          <div className="row spread">
            <h2 className="h2">Gift Roadmap</h2>
            <span className="muted">Tap a gift to jump</span>
          </div>

          <div className="roadmap">
            <RoadItem n={1} done={unlocked[1]} onClick={() => scrollTo("gift-1")} />
            <RoadItem n={2} done={unlocked[2]} locked={!gift2Available} onClick={() => scrollTo("gift-2")} />
            <RoadItem n={3} done={unlocked[3]} locked={!gift3Available} onClick={() => scrollTo("gift-3")} />
            <RoadItem n={4} done={unlocked[4]} locked={!gift4Available} onClick={() => scrollTo("gift-4")} />
          </div>
        </div>
      </section>

      {/* Gift 1 */}
      <section id="gift-1" className="section">
        <div className="glass card">
          <GiftHeader
            title="Gift 1 — Warm-up"
            subtitle="Put these moments in order."
            status={unlocked[1] ? "Unlocked ✅" : "Locked 🔒"}
          />
          <DevControls
  show={DEV_CONTROLS}
  gift={1}
  unlocked={unlocked[1]}
  onUnlock={() => {
  setGiftUnlocked(1, true);
  premiumConfettiBurst("medium");
  setCelebrateGift(1);
}}
  onLock={() => setGiftUnlocked(1, false)}
/>

          <Gift1TimelinePuzzle
            solved={unlocked[1]}
            onSolved={() => unlockGift(1)}
          />

          {unlocked[1] && (
  <GiftReveal
    title="Gift #1 — Appreciation"
    body={`Your presence has always mattered.

I don't say it enough, but I'm genuinely proud of you.
For how you handle things. For how you keep going. For being you.

And yes… hate you, as always 😼`}
    ctaLabel="Go to Gift 2 →"
    onCta={() => scrollTo("gift-2")}
  />
)}
        </div>
      </section>

      {/* Gift 2 */}
      <section id="gift-2" className="section">
        <div className={`glass card ${!gift2Available ? "disabled" : ""}`}>
          <GiftHeader
            title="Gift 2 — Cipher"
            subtitle="Decode it. Easy."
            status={
              !gift2Available ? "Locked 🔒 (unlock Gift 1 first)" : unlocked[2] ? "Unlocked ✅" : "Locked 🔒"
            }
          />
          <DevControls
  show={DEV_CONTROLS}
  gift={2}
  unlocked={unlocked[2]}
  onUnlock={() => {
  setGiftUnlocked(2, true);
  premiumConfettiBurst("medium");
  setCelebrateGift(2);
}}
  onLock={() => setGiftUnlocked(2, false)}
/>

          {gift2Available && (
            <>
              <Gift2CipherPuzzle
                solved={unlocked[2]}
                onSolved={() => unlockGift(2)}
              />

              {unlocked[2] && (
  <div style={{ marginTop: 16 }}>
    <div className="reveal">
      <h3 className="h3">Gift #2 🍫</h3>

      <div className="giftMedia">
        <img
  className="giftImgBanner"
  src={new URL("./assets/gift2/5star.jpg", import.meta.url).toString()}
  alt="5 Star chocolate"
/>
        <div>
          <p className="p" style={{ marginBottom: 8 }}>
            For the laziest person.
          </p>
        </div>
      </div>
    </div>
  </div>
)}
  </>
)}
        </div>
      </section>

      {/* Gift 3 */}
      <section id="gift-3" className="section">
        <div className={`glass card ${!gift3Available ? "disabled" : ""}`}>
          <GiftHeader
            title="Gift 3 — Chess"
            subtitle="White to move. Mate in 3."
            status={
              !gift3Available ? "Locked 🔒 (unlock Gift 1 & 2 first)" : unlocked[3] ? "Unlocked ✅" : "Locked 🔒"
            }
          />
          <DevControls
  show={DEV_CONTROLS}
  gift={3}
  unlocked={unlocked[3]}
  onUnlock={() => {
  setGiftUnlocked(3, true);
  premiumConfettiBurst("medium");
  setCelebrateGift(3);
}}
  onLock={() => setGiftUnlocked(3, false)}
/>

          {gift3Available && (
  <>
    <Gift3ChessPuzzle
      solved={unlocked[3]}
      onSolved={() => unlockGift(3)}
    />

    {unlocked[3] && (
  <div id="gift3-greedy">
    <Gift3GreedySequence onNext={() => scrollTo("gift-4")} />
  </div>
)}
  </>
)}
        </div>
      </section>

      {/* Gift 4 */}
      <section id="gift-4" className="section">
        <div className={`glass card ${!gift4Available ? "disabled" : ""}`}>
          <GiftHeader
            title="Gift 4 — Final"
            subtitle="Choose your vibe."
            status={
              !gift4Available ? "Locked 🔒 (unlock Gift 3 first)" : unlocked[4] ? "Unlocked ✅" : "Locked 🔒"
            }
          />
          <DevControls
  show={DEV_CONTROLS}
  gift={4}
  unlocked={unlocked[4]}
  onUnlock={() => {
  setGiftUnlocked(4, true);
  premiumConfettiBurst("medium");
  setCelebrateGift(4);
}}
  onLock={() => setGiftUnlocked(4, false)}
/>

          {gift4Available && (
  <>
    <Gift4Choices solved={unlocked[4]} onSolved={() => unlockGift(4)} />

    {unlocked[4] && (
      <div style={{ marginTop: 16 }}>
        <div className="final">
          <h2 className="h2">Final Gift 🎁</h2>
          <p className="p">
            This will be a good gift , WAIT AND WATCH !!
            {"\n\n"}
            A very happy birthday to you once again.
          </p>
          <button
            className="btn"
            onClick={() => {
              logEvent("replay_clicked");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Replay everything
          </button>
        </div>
      </div>
    )}
  </>
)}
        </div>
      </section>

      <footer className="footer">
        <span className="muted">Made with ✨ and a little chaos.</span>
      </footer>
    </div>
  );
}

function Gift3GreedySequence({ onNext }: { onNext: () => void }) {
  // Choose behavior:
  // true  = lines STACK (line1 stays, then line2 appears under it, etc.)
  // false = lines REPLACE (only one line visible at a time)
  const STACK_LINES = true;

  const lines = [
    "for wanting more kindness than the world gives",
    "for dreaming bigger every time",
    "for still staying soft",
    "Okay, I will teach you chess, no worries 😼",
  ];

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    logEvent("gift3_sequence_start");

    const timers: number[] = [];

    // show 1st line after 2s, then next every 2s
    for (let i = 0; i < lines.length; i++) {
      const t = window.setTimeout(() => {
        setIdx(i + 1);
        logEvent("gift3_sequence_line_shown", { index: i, text: lines[i] });
      }, 3000 * (i + 1));
      timers.push(t);
    }

    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  const visibleLines = STACK_LINES ? lines.slice(0, idx) : idx === 0 ? [] : [lines[idx - 1]];

  return (
    <div className="gift3Reveal">
      <div className="gift3Big">Greedy !!</div>

      <div className="gift3Lines">
        {visibleLines.map((t, i) => (
          <div key={`${i}-${t}`} className="gift3Line">
            {t}
          </div>
        ))}
      </div>

      <button
        className="btn"
        style={{ marginTop: 20 }}
        onClick={() => {
          logEvent("gift3_next_clicked");
          onNext();
        }}
      >
        Go to Gift 4 →
      </button>
    </div>
  );
}

function RoadItem({
  n,
  done,
  locked,
  onClick,
}: {
  n: number;
  done: boolean;
  locked?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`roadItem ${done ? "done" : ""} ${locked ? "locked" : ""}`}
      onClick={() => {
        logEvent("roadmap_click", { gift: n, locked: !!locked });
        onClick();
      }}
      disabled={!!locked}
    >
      <div className="roadNum">{n}</div>
      <div className="roadLabel">
        {done ? "Unlocked" : locked ? "Locked" : "Ready"}
      </div>
    </button>
  );
}

function GiftHeader({ title, subtitle, status }: { title: string; subtitle: string; status: string }) {
  return (
    <div className="giftHeader">
      <div>
        <h2 className="h2">{title}</h2>
        <p className="muted">{subtitle}</p>
      </div>
      <div className="pill">{status}</div>
    </div>
  );
}

function GiftReveal({
  title,
  body,
  imgSrc,
  imgAlt,
  ctaLabel,
  onCta,
}: {
  title: string;
  body: string;
  imgSrc?: string;
  imgAlt?: string;
  ctaLabel?: string;
  onCta?: () => void;
}) {
  return (
    <div className="reveal">
      <h3 className="h3">{title}</h3>

      {imgSrc && (
        <img className="revealImg" src={imgSrc} alt={imgAlt || "gift"} />
      )}

      <p className="p">{body}</p>

      {ctaLabel && onCta && (
        <button
          className="btn"
          onClick={() => {
            logEvent("reveal_cta_click", { title, ctaLabel });
            onCta();
          }}
          style={{ marginTop: 14 }}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}

/** ---------------- INTRO ---------------- */
function Intro({ onDone }: { onDone: () => void }) {
  // 5 beats: 4 text + 1 image
  const steps = ["Hi", "Ready?", "Let's go", "Don't Smile :)"] as const;
  const [i, setI] = useState(0);
  const [showImage, setShowImage] = useState(false);

  // ✅ import your image
  // If Vite complains, make sure the file exists exactly at this path.
  const imgUrl = new URL("./assets/cuteDogCamera.jpg", import.meta.url).toString();

  useEffect(() => {
    if (!showImage) logEvent("intro_step_viewed", { step: steps[i], index: i });
    else logEvent("intro_image_viewed");
  }, [i, showImage]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!showImage) {
        if (i < steps.length - 1) setI(i + 1);
        else setShowImage(true); // after "smile :)" show image beat
      } else {
        onDone(); // auto-finish after image beat
      }
    }, showImage ? 3000 : 2500);

    return () => clearTimeout(t);
  }, [i, showImage, onDone]);

  const advance = () => {
    logEvent("intro_tap_advance", { index: i, showImage });

    if (!showImage) {
      if (i < steps.length - 1) setI(i + 1);
      else setShowImage(true);
    } else {
      onDone();
    }
  };

  return (
    <div className="intro" onClick={advance} role="button" aria-label="Intro screen">
      {!showImage ? (
        <>
          <div className="introText">{steps[i]}</div>
          <div className="introHint">tap anywhere</div>
        </>
      ) : (
        <>
          <img className="introImg" src={imgUrl} alt="intro" />
          <div className="introHint">tap to continue</div>
        </>
      )}
    </div>
  );
}
function TwinklingStars() {
  const stars = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: `${2 + Math.random() * 2.5}px`,
        delay: `${Math.random() * 4}s`,
        duration: `${2.2 + Math.random() * 2.8}s`,
        opacity: 0.25 + Math.random() * 0.35,
      })),
    []
  );

  return (
    <div className="stars" aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.id}
          className="star"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
            animationDuration: s.duration,
            opacity: s.opacity,
          }}
        />
      ))}
    </div>
  );
}

/** ---------------- BACKGROUND ---------------- */
function Background() {
  return (
    <>
      <div className="bgAurora" />
      <div className="bgNoise" />
      <Particles />
      <TwinklingStars />
    </>
  );
}

function Particles() {
  const dots = useMemo(() => Array.from({ length: 28 }, (_, k) => k), []);
  return (
    <div className="particles">
      {dots.map((k) => (
        <span key={k} className="dot" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 4}s` }} />
      ))}
    </div>
  );
}

/** ---------------- GIFT 1 (ORDER PUZZLE) ---------------- */
function Gift1TimelinePuzzle({
  onSolved,
  solved,
}: {
  onSolved: () => void;
  solved: boolean;
}) {
  const correct = [
    {
      id: "met",
      label: "Jhakaas photoshoot !!",
      img: new URL("./assets/gift1/1.jpeg", import.meta.url).toString(),
    },
    {
      id: "joke",
      label: "Cheesecake and fun",
      img: new URL("./assets/gift1/2.jpeg", import.meta.url).toString(),
    },
    {
      id: "best",
      label: "Mat 😭",
      img: new URL("./assets/gift1/3.jpeg", import.meta.url).toString(),
    },
    {
      id: "today",
      label: "Macbooook !!",
      img: new URL("./assets/gift1/4.jpeg", import.meta.url).toString(),
    },
  ] as const;

  type Item = (typeof correct)[number];

  const [items, setItems] = useState<Item[]>(() => shuffle([...correct]));
  const [msg, setMsg] = useState<string>("Reorder the photos into the right timeline.");

  useEffect(() => {
    logEvent("gift_opened", { gift: 1 });
  }, []);

  // Once solved becomes true (from parent), show a nice status message
  useEffect(() => {
    if (solved) setMsg("Solved ✅");
  }, [solved]);

  const swap = (a: number, b: number) => {
    if (solved) return; // freeze after solved
    setItems((prev) => {
      const next = [...prev];
      [next[a], next[b]] = [next[b], next[a]];
      logEvent("gift1_reorder", {
        from: a,
        to: b,
        next: next.map((x) => x.id),
      });
      return next;
    });
  };

  const check = () => {
    if (solved) return;

    const ok =
      items.map((x) => x.id).join("|") === correct.map((x) => x.id).join("|");

    logEvent("puzzle_attempt", {
      gift: 1,
      ok,
      order: items.map((x) => x.id),
    });

    if (!ok) {
      setMsg("Not yet 😼 Try again.");
      return;
    }

    setMsg("Perfect ✅");
    logEvent("puzzle_solved", { gift: 1 });
    onSolved();
  };

  return (
    <div className="puzzle">
      <div className="row spread">
        <p className="p" style={{ margin: 0 }}>
          Put these photos in the right order:
        </p>
        <span className="pill">{solved ? "Unlocked ✅" : "Locked 🔒"}</span>
      </div>

      <div className={`imgList ${solved ? "frozen" : ""}`}>
        {items.map((it, idx) => (
          <div key={it.id} className="imgRow">
            <div className="imgCard">
              <img className="imgThumb" src={it.img} alt={it.label} />
              <div className="imgCap">{it.label}</div>
            </div>

            <div className="listBtns">
              <button
                className="miniBtn"
                disabled={solved || idx === 0}
                onClick={() => swap(idx, idx - 1)}
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                className="miniBtn"
                disabled={solved || idx === items.length - 1}
                onClick={() => swap(idx, idx + 1)}
                aria-label="Move down"
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="row">
        <button className="btn primary" onClick={check} disabled={solved}>
          {solved ? "Unlocked" : "Unlock Gift 1"}
        </button>
        <span className="muted">{msg}</span>
      </div>
    </div>
  );
}

function shuffle<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** ---------------- GIFT 2 (CIPHER) ---------------- */
function Gift2CipherPuzzle({
  onSolved,
  solved,
}: {
  onSolved: () => void;
  solved: boolean;
}) {
  const target = "YOUAREMAGIC";
  const [val, setVal] = useState("");
  const [hint, setHint] = useState(false);
  const [msg, setMsg] = useState("Decode it and type the message.");

  useEffect(() => {
    logEvent("gift_opened", { gift: 2 });
  }, []);

  useEffect(() => {
    if (solved) {
      setMsg("Solved ✅");
      // lock input to the correct answer for a “finished” look
      setVal("YOU ARE MAGIC");
    }
  }, [solved]);

  const submit = () => {
    if (solved) return;

    const cleaned = val.trim().toUpperCase().replace(/\s+/g, "");
    const ok = cleaned === target;

    logEvent("gift2_cipher_submit", { input: val, cleaned, ok });

    if (!ok) {
      setMsg("Not yet 😼 (try replacing numbers with letters)");
      return;
    }

    setMsg("Perfect ✅");
    logEvent("puzzle_solved", { gift: 2 });
    onSolved();
  };

  return (
    <div className="puzzle">
      <div className="row spread">
        <div>
          <div className="cipherBox">
            <div className="cipherText">Y0U 4R3 M4G1C</div>
            <div className="muted small">Decode it → type the message</div>
          </div>
        </div>
        <span className="pill">{solved ? "Unlocked ✅" : "Locked 🔒"}</span>
      </div>

      <div className="row">
        <input
          className="input"
          placeholder="your answer..."
          value={val}
          disabled={solved}
          onChange={(e) => {
            setVal(e.target.value);
            logEvent("gift2_input_change", { len: e.target.value.length });
          }}
        />
        <button className="btn primary" onClick={submit} disabled={solved}>
          {solved ? "Unlocked" : "Submit"}
        </button>
      </div>

      <div className="row">
        <button
          className="btn"
          disabled={solved}
          onClick={() => {
            setHint(true);
            logEvent("gift2_hint_clicked");
          }}
        >
          Hint
        </button>

        <span className="muted">{msg}</span>
      </div>

      {hint && !solved && (
        <div className="muted small">
          Numbers replace letters (0→O, 4→A, 3→E, 1→I).
        </div>
      )}
    </div>
  );
}

/** ---------------- GIFT 3 (CHESS) ---------------- */
type Piece = string; // unicode piece char
type Square = string; // like "e4"

function Gift3ChessPuzzle({
  onSolved,
  solved,
}: {
  onSolved: () => void;
  solved: boolean;
}) {
  // We script this puzzle:
  // 1) White: Bxf7+ (h6 -> f7)
  // ... Black: Kxf7 (g8 -> f7)
  // 2) White: Ng5+ (e4 -> g5)
  // ... Black: Kf6 (f7 -> f6)
  // 3) White: Qe6# (e2 -> e6)
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [board, setBoard] = useState<Record<Square, Piece>>(() => startPosition());
  const [selected, setSelected] = useState<Square | null>(null);
  const [toast, setToast] = useState("Tap a piece, then a square. Hint: give check.");

  useEffect(() => {
    logEvent("gift_opened", { gift: 3 });
    logEvent("gift3_stage_viewed", { stage });
  }, []);

  useEffect(() => {
    logEvent("gift3_stage_viewed", { stage });
  }, [stage]);

  const allowedMoveForStage = (): { from: Square; to: Square } => {
    if (stage === 1) return { from: "c4", to: "f7" };
    if (stage === 2) return { from: "e4", to: "g5" };
    return { from: "e2", to: "e6" };
  };

  useEffect(() => {
  if (solved) {
    setToast("CHECKMATE (solved ✅)");
    setSelected(null);
  }
}, [solved]);

  const clickSquare = (sq: Square) => {
    if(solved) return;
    // select
    if (!selected) {
      const piece = board[sq];
      if (!piece) return;

      // Only allow selecting the correct piece for the current stage
      const { from } = allowedMoveForStage();
      if (sq !== from) {
        setToast("Try a stronger piece 😉");
        logEvent("gift3_select_wrong_piece", { sq, stage });
        return;
      }
      setSelected(sq);
      setToast("Now choose the destination square ✨");
      logEvent("gift3_piece_selected", { sq, stage });
      return;
    }

    // attempt move
    const { from, to } = allowedMoveForStage();
    const attempt = { from: selected, to: sq, stage };

    if (selected !== from || sq !== to) {
      setToast("Almost… give a sharper check ♡");
      setSelected(null);
      logEvent("gift3_move_attempt", { ...attempt, correct: false });
      return;
    }

    // Correct move
    logEvent("gift3_move_attempt", { ...attempt, correct: true });
    animateMove(from, to);

    const next = move(board, from, to);
    setBoard(next);
    setSelected(null);

    // scripted black replies with a tiny delay
    setTimeout(() => {
      if (stage === 1) {
        // ...Kxf7 : g8 -> f7 (capture bishop)
        setBoard((b) => move(b, "g8", "f7"));
        logEvent("gift3_opponent_move", { from: "g8", to: "f7" });
        setStage(2);
        setToast("Nice. Again.");
      } else if (stage === 2) {
        // ...Kf6 : f7 -> f6
        setBoard((b) => move(b, "f7", "f6"));
        logEvent("gift3_opponent_move", { from: "f7", to: "f6" });
        setStage(3);
        setToast("One last move.");
      } else {
        // stage 3 done -> checkmate
        setToast("CHECKMATE ♡");
        logEvent("puzzle_solved", { gift: 3 });
        setTimeout(() => onSolved(), 600);
      }
    }, 450);
  };

  return (
    <div className="puzzle">
      <div className="row spread">
        <div>
          <div className="muted">White to move • Stage {stage}/3</div>
          <div className="small muted">Goal: mate in 3 (you’re doing the white moves)</div>
        </div>
        <button
          className="btn"
          disabled={solved}
          onClick={() => {
            setToast(stage === 1 ? "Try a checking move with the bishop." : stage === 2 ? "Knight jumps are sneaky." : "Queen finishes it.");
            logEvent("gift3_hint_clicked", { stage });
          }}
        >
          Hint
        </button>
      </div>

      <div className="chessWrap">
        <ChessBoard
          board={board}
          selected={selected}
          onSquareClick={clickSquare}
        />
      </div>

      <div className="toast">{toast}</div>
      <div className="muted small">
        You only need to find the best move each stage — the opponent replies automatically.
      </div>
    </div>
  );
}

function animateMove(from: Square, to: Square) {
  // purely for logging/feel; CSS handles main animations
  logEvent("gift3_move_animated", { from, to });
}

function move(b: Record<Square, Piece>, from: Square, to: Square) {
  const next = { ...b };
  const piece = next[from];
  delete next[from];
  // capture any piece on "to"
  next[to] = piece;
  return next;
}

function startPosition(): Record<Square, Piece> {
  // from FEN: r1b1r1kq/pppnpp1p/1n4pB/8/4N2P/1BP5/PP1PQPP1/R3K2R w KQ - 0 1
  // We'll map needed pieces only (enough for the puzzle + looks correct)
  // White: King e1, Queen e2, Bishop c3, Bishop h6, Knight e4, Rook a1, Rook h1, pawns: a2 b2 c2 f2 g2 h4 b3? (from "1BP5" has B at c3 and P at b3)
  // Black: King g8, Queen h8, rooks a8 e8, bishops c8, knight b6 d7, pawns: a7 b7 c7 e7 f7 h7 g6? etc
  return {
    // Black back rank
    a8: "♜",
    c8: "♝",
    e8: "♜",
    g8: "♚",
    h8: "♛",
    // Black pawns / pieces
    a7: "♟",
    b7: "♟",
    c7: "♟",
    d7: "♞",
    e7: "♟",
    f7: "♟",
    h7: "♟",
    b6: "♞",
    g6: "♟",

    // White pieces
    a1: "♖",
    h1: "♖",
    e1: "♔",
    e2: "♕",
    c3: "♘",
    c4: "♗",
    e4: "♘",

    // White pawns (approx per FEN)
    a2: "♙",
    b2: "♙",
    c2: "♙",
    b3: "♙",
    f2: "♙",
    g2: "♙",
    h4: "♙",
  };
}

function ChessBoard({
  board,
  selected,
  onSquareClick
}: {
  board: Record<Square, Piece>;
  selected: Square | null;
  onSquareClick: (sq: Square) => void;
}) {
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [sqPx, setSqPx] = useState(44); // square size in px (integer)

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const compute = () => {
      // available width inside the card
      const w = el.getBoundingClientRect().width;

      // choose an integer square size, then board = sq * 8 exactly
      const rawSq = Math.floor(w / 8);

      // clamp square size so board doesn’t get too small/large
      const clampedSq = Math.max(30, Math.min(rawSq, 64));

      setSqPx(clampedSq);
    };

    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const sqClass = (sq: Square, isDark: boolean) => {
    const cls = ["sq", isDark ? "dark" : "light"];
    if (sq === selected) cls.push("selected");
    return cls.join(" ");
  };

  return (
    <div ref={wrapRef} className="chessWrap" style={{ width: "100%" }}>
      <div className="board" style={{ ["--sq" as any]: `${sqPx}px` }}>
        {ranks.map((r) =>
          files.map((f, idx) => {
            const sq = `${f}${r}` as Square;
            const isDark = (idx + r) % 2 === 0;
            const piece = board[sq];

            return (
              <button
                key={sq}
                className={sqClass(sq, isDark)}
                onClick={() => onSquareClick(sq)}
              >
                <span className={`piece ${piece ? "has" : ""}`}>{piece || ""}</span>
                <span className="sqLabel">{sq}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

/** ---------------- GIFT 4 (CHOICES) ---------------- */
function Gift4Choices({
  onSolved,
  solved,
}: {
  onSolved: () => void;
  solved: boolean;
}) {
  const questions = [
    { id: 1, q: "Junoon or Sukoon?", a: ["Junoon", "Sukoon"] },
    { id: 2, q: "Mountains or sea?", a: ["Mountains", "Sea"] },
    { id: 3, q: "FC Road or JM Road?", a: ["FC Road", "JM Road"] },
    { id: 4, q: "Plan or spontaneity?", a: ["Plan", "Spontaneous"] },
  ] as const;

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    logEvent("gift_opened", { gift: 4 });
  }, []);

  const choose = (choice: string) => {
    if (solved) return;
    const q = questions[idx];
    logEvent("gift4_choice", { questionId: q.id, choice });

    setAnswers((p) => ({ ...p, [q.id]: choice }));
    if (idx < questions.length - 1) setIdx(idx + 1);
    else {
      logEvent("puzzle_solved", { gift: 4, answers: { ...answers, [q.id]: choice } });
      onSolved();
    }
  };

  const q = questions[idx];

  return (
    <div className="puzzle">
      <div className="muted small">Question {idx + 1} / {questions.length}</div>
      <h3 className="h3">{q.q}</h3>

      <div className="choices">
        {q.a.map((c) => (
          <button key={c} disabled={solved} className="btn choice" onClick={() => choose(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="muted small">
        This doesn’t decide the gift. It just makes the ending feel like *you*.
      </div>
    </div>
  );
}