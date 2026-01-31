import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import StoreProvider from "@/redux/storeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Satellite Tracker",
  description: "Track Satellites from anywhere",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className + " bg-slate-950"}>
        <StoreProvider>
          <div className="h-full w-full">
            <Header />
            {children}
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
