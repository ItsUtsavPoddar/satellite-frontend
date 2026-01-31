"use client";
import FormSAT from "./FormSAT";
// import LeafMap from "./LeafMap";
import dynamic from "next/dynamic";
import { Rnd } from "react-rnd";
import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "satellitePanelRect";
const OPEN_KEY = "satellitePanelOpen";

function clampRect(rect, vw, vh) {
  const minW = 360;
  const minH = 360;
  const width = Math.max(minW, Math.min(rect.width ?? 440, vw));
  const height = Math.max(minH, Math.min(rect.height ?? 640, vh));
  const x = Math.max(0, Math.min(rect.x ?? 24, vw - width));
  const y = Math.max(0, Math.min(rect.y ?? 96, vh - height));
  return { x, y, width, height };
}

function loadRect() {
  try {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {}
  return null;
}

function loadOpen() {
  if (typeof window === "undefined") return true;
  const raw = localStorage.getItem(OPEN_KEY);
  if (raw === null) return true; // default open
  return raw === "true";
}

// Simple pinch-zoom wrapper (two-finger only)
function PinchZoom({ children }) {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);
  const pointers = useRef(new Map());
  const start = useRef({ dist: 0, scaleAtStart: 1, origin: "50% 0%" });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onPointerDown = (e) => {
      if (e.pointerType !== "touch") return;
      el.setPointerCapture?.(e.pointerId);
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    };

    const onPointerMove = (e) => {
      if (e.pointerType !== "touch") return;
      if (!pointers.current.has(e.pointerId)) return;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.current.size === 2) {
        const pts = Array.from(pointers.current.values());
        const dx = pts[0].x - pts[1].x;
        const dy = pts[0].y - pts[1].y;
        const dist = Math.hypot(dx, dy);

        if (start.current.dist === 0) {
          start.current.dist = dist;
          start.current.scaleAtStart = scale;
          // set transform-origin to midpoint between fingers relative to element
          const rect = el.getBoundingClientRect();
          const midX = (pts[0].x + pts[1].x) / 2 - rect.left;
          const midY = (pts[0].y + pts[1].y) / 2 - rect.top;
          const ox = `${(midX / rect.width) * 100}%`;
          const oy = `${(midY / rect.height) * 100}%`;
          start.current.origin = `${ox} ${oy}`;
          el.style.transformOrigin = start.current.origin;
        } else {
          const factor = dist / start.current.dist;
          const next = Math.max(
            0.8,
            Math.min(2, start.current.scaleAtStart * factor),
          );
          setScale(next);
        }
      }
    };

    const onPointerUp = (e) => {
      if (e.pointerType !== "touch") return;
      pointers.current.delete(e.pointerId);
      if (pointers.current.size < 2) {
        start.current.dist = 0;
      }
    };

    // Important: allow two-finger gestures but keep single-finger scroll
    // We avoid setting touch-action: none on the scroll container.
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
    };
  }, [scale]);

  return (
    <div
      ref={ref}
      // Do NOT use touch-action: none here to preserve scrolling; browsers will still deliver two-pointer moves
      style={{ transform: `scale(${scale})` }}
      className="origin-top"
    >
      {children}
    </div>
  );
}

const Main = () => {
  const LeafMap = useMemo(
    () =>
      dynamic(() => import("./LeafMap"), {
        loading: () => <p>A map is loading</p>,
        ssr: false,
      }),
    [],
  );

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [panel, setPanel] = useState({ x: 24, y: 96, width: 440, height: 640 });

  // Initialize from localStorage and viewport after mount
  useEffect(() => {
    setMounted(true);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const saved = loadRect();
    const initial = saved ?? { x: vw - 480, y: 96, width: 440, height: 640 };
    setPanel(clampRect(initial, vw, vh));
    setIsOpen(loadOpen());
  }, []);

  // Persist helper
  const save = (next) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setPanel((prev) => {
      const merged = { ...prev, ...next };
      const clamped = clampRect(merged, vw, vh);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clamped));
      } catch {}
      return clamped;
    });
  };

  // Keep panel on-screen when window resizes
  useEffect(() => {
    if (!mounted) return;
    const onResize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setPanel((prev) => clampRect(prev, vw, vh));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [mounted]);

  // Listen for header toggle events + storage sync (so multiple tabs stay in sync)
  useEffect(() => {
    if (!mounted) return;
    const onToggle = () => {
      setIsOpen((prev) => {
        const next = !prev;
        try {
          localStorage.setItem(OPEN_KEY, String(next));
        } catch {}
        return next;
      });
    };
    const onStorage = (e) => {
      if (e.key === OPEN_KEY && e.newValue != null) {
        setIsOpen(e.newValue === "true");
      }
    };
    window.addEventListener("satellite-panel:toggle", onToggle);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("satellite-panel:toggle", onToggle);
      window.removeEventListener("storage", onStorage);
    };
  }, [mounted]);

  return (
    <div className="fixed inset-0 top-[56px]">
      {mounted && (
        <div className="absolute inset-0">
          <LeafMap />
        </div>
      )}

      {/* Always render FormSAT for data loading - prevents API recalls */}
      {mounted && (
        <Rnd
          size={{ width: panel.width, height: panel.height }}
          position={{ x: panel.x, y: panel.y }}
          minWidth={360}
          minHeight={360}
          bounds="window"
          dragHandleClassName="drag-handle"
          onDragStop={(e, d) => save({ x: d.x, y: d.y })}
          onResizeStop={(e, dir, ref, delta, pos) =>
            save({ width: ref.offsetWidth, height: ref.offsetHeight, ...pos })
          }
          style={{
            position: "fixed",
            zIndex: 1001,
            display: isOpen ? "block" : "none",
          }}
          enableUserSelectHack={false}
          disableDragging={false}
        >
          <div className="h-full overflow-hidden rounded border border-zinc-800 bg-zinc-950">
            {/* Drag handle bar only (keeps content interactive) */}
            <div className="drag-handle flex items-center justify-between gap-2 border-b border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 cursor-move select-none">
              <span className="font-semibold">SATELLITES</span>
              {/* Local close button for convenience */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  try {
                    localStorage.setItem(OPEN_KEY, "false");
                  } catch {}
                }}
                className="rounded px-2 py-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
                aria-label="Close panel"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Scrollable + pinch-zoomable content */}
            <div className="h-[calc(100%-40px)] overflow-y-auto p-2 sm:p-3">
              <PinchZoom>
                <div className="origin-top scale-[0.9] sm:scale-100">
                  <FormSAT />
                </div>
              </PinchZoom>
            </div>
          </div>
        </Rnd>
      )}
    </div>
  );
};

export default Main;
