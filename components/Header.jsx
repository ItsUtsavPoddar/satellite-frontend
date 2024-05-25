import { SheetTrigger, SheetContent, Sheet } from "./ui/sheet";
import { Button } from "./ui/button";
import Link from "next/link";

const Header = () => {
  return (
    <>
      <div className="font-cust  text-white fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-[#0a0a0a] bg-opacity-95 text-lg">
        <div className="text-xl  font-light">
          <Link className="cursor-pointer" href="/">
            Satellites Tracker
          </Link>
        </div>
        <nav className=" hidden gap-4 justify-center lg:flex ">
          <Link className="hover:underline cursor-pointer" href="/">
            Contact
          </Link>
        </nav>
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
              <Link className="hover:underline cursor-pointer" href="/">
                About
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default Header;

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
