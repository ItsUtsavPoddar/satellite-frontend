"use client";
import FormSAT from "./FormSAT";
// import LeafMap from "./LeafMap";
import dynamic from "next/dynamic";
import { Rnd } from "react-rnd";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "satellitePanelRect";

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

const Main = () => {
  const LeafMap = useMemo(
    () =>
      dynamic(() => import("./LeafMap"), {
        loading: () => <p>A map is loading</p>,
        ssr: false,
      }),
    []
  );

  const [mounted, setMounted] = useState(false);
  const [panel, setPanel] = useState({ x: 24, y: 96, width: 440, height: 640 });

  // Initialize from localStorage and viewport after mount
  useEffect(() => {
    setMounted(true);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const saved = loadRect();
    const initial = saved ?? { x: vw - 480, y: 96, width: 440, height: 640 };
    setPanel(clampRect(initial, vw, vh));
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

  return (
    <div className="pt-20 pb-10 justify-center pr-0 gap-4 grid grid-cols-1 lg:grid-cols-6 sm:items-center">
      <div className="z-0 col-start-1 col-end-2 lg:col-start-1 lg:col-end-4">
        <LeafMap />
      </div>

      {/* Render the movable/resizable widget only after mount to avoid SSR window access */}
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
          style={{ position: "fixed", zIndex: 20 }}
          enableUserSelectHack={false}
        >
          <div className="h-full overflow-y-auto rounded-xl border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur-md drag-handle">
            {/* <div className="drag-handle mb-2 cursor-move select-none rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm font-medium text-white/80">
              Satellites 
            </div> */}
            <FormSAT />
          </div>
        </Rnd>
      )}
    </div>
  );
};

export default Main;
