"use client";
import { SheetTrigger, SheetContent, Sheet, SheetTitle } from "./ui/sheet";
import { Button } from "./ui/button";
import Link from "next/link";
import {
  Satellite,
  Menu,
  PanelLeft,
  Orbit,
  Radio,
  Github,
  Globe,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const togglePanel = () => {
    try {
      const current = localStorage.getItem("satellitePanelOpen");
      const next = current === "true" ? "false" : "true";
      localStorage.setItem("satellitePanelOpen", next);
    } catch {}
    window.dispatchEvent(new Event("satellite-panel:toggle"));
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      {/* Solid dark background */}
      <div className="absolute inset-0 bg-zinc-950 border-b border-zinc-900" />

      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo - clean and minimal */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <Satellite className="h-6 w-6 text-zinc-400 group-hover:text-zinc-300 transition-colors" />
              </div>

              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-zinc-100">
                  ORBITAL
                </span>
                <span className="text-[9px] text-zinc-500 tracking-widest font-mono uppercase">
                  Satellite Tracking
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                href="https://utsv.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded transition-all"
              >
                <Globe className="inline-block w-4 h-4 mr-2" />
                <span>Portfolio</span>
              </Link>
              <a
                href="https://github.com/ItsUtsavPoddar"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded transition-all"
              >
                <Github className="inline-block w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                <span>GitHub</span>
                <div className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-cyan-400 to-blue-400 group-hover:w-full transition-all duration-300" />
              </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Toggle Panel Button - Always visible */}
              <button
                type="button"
                onClick={togglePanel}
                className="flex items-center px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded transition-all"
                aria-label="Toggle satellite panel"
                title="Toggle Panel"
              >
                <PanelLeft className="inline-block w-4 h-4 mr-2" />
                <span className="inline">Toggle Panel</span>
              </button>

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="lg:hidden text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-72 bg-zinc-950 border-l border-zinc-900"
                >
                  <div className="flex flex-col gap-6 pt-8">
                    <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
                      <Satellite className="h-6 w-6 text-zinc-400" />
                      <SheetTitle className="text-lg font-bold text-zinc-100">
                        ORBITAL
                      </SheetTitle>
                    </div>
                    <nav className="flex flex-col gap-2">
                      <Link
                        href="https://utsv.tech"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors py-3 px-4 rounded"
                      >
                        <Globe className="w-5 h-5" />
                        <span className="font-medium">Portfolio</span>
                      </Link>
                      <a
                        href="https://github.com/ItsUtsavPoddar"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors py-3 px-4 rounded"
                      >
                        <Github className="w-5 h-5" />
                        <span className="font-medium">GitHub</span>
                      </a>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
