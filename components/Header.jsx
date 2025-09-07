"use client";
import { SheetTrigger, SheetContent, Sheet } from "./ui/sheet";
import { Button } from "./ui/button";
import Link from "next/link";

export default function Header() {
  const togglePanel = () => {
    try {
      // flip persisted state so new tabs keep in sync
      const current = localStorage.getItem("satellitePanelOpen");
      const next = current === "true" ? "false" : "true";
      localStorage.setItem("satellitePanelOpen", next);
    } catch {}
    window.dispatchEvent(new Event("satellite-panel:toggle"));
  };

  return (
    <header className="fixed top-0 inset-x-0 z-30">
      <div className="font-cust  text-white fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-[#0a0a0a] bg-opacity-95 text-lg">
        <div className="text-xl  font-light">
          <Link className="cursor-pointer" href="/">
            Satellites Tracker
          </Link>
        </div>
        <nav className=" hidden gap-4 justify-center lg:flex ">
          <Link
            className="hover:underline cursor-pointer"
            target="blank"
            href="https://utsavpoddar.tech"
          >
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                className="lg:hidden bg-[#000000] text-white"
                size="icon"
                variant=""
              >
                <MenuIcon className="h-7 w-7" />
              </Button>
            </SheetTrigger>
            <SheetContent
              className="bg-[#171717] text-white border-0 w-60"
              side="right"
            >
              <div className="grid gap-4 p-4 ">
                <Link
                  className="hover:underline cursor-pointer"
                  href="https://utsv.tech"
                  target="blank"
                >
                  Contact
                </Link>
              </div>
            </SheetContent>
          </Sheet>
          <button
            type="button"
            onClick={togglePanel}
            className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white/90 hover:bg-white/15 backdrop-blur-md"
            aria-label="Toggle satellite panel"
            title="Toggle satellite panel"
          >
            Panel
          </button>
        </div>
      </div>
    </header>
  );
}

function MenuIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}
