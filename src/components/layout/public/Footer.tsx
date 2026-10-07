import { Scale } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#dfe6e2] bg-[#f8faf8]">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-9 sm:px-8 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1b392e]"
          >
            <Scale size={17} /> Justice Desk
          </Link>
          <p className="mt-2 max-w-md text-xs leading-5 text-[#77837c]">
            Legal consultation and case management for clients, lawyers, and
            administrators.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#647168]">
          <Link href="/about-us" className="hover:text-[#174638]">
            About
          </Link>
          <Link href="/apply" className="hover:text-[#174638]">
            Apply as a lawyer
          </Link>
          <Link href="/login" className="hover:text-[#174638]">
            Sign in
          </Link>
          <Link href="/register" className="hover:text-[#174638]">
            Client registration
          </Link>
        </nav>
      </div>
      <div className="border-t border-[#e5ebe7] px-5 py-3 text-center text-[10px] text-[#87928b]">
        © {new Date().getFullYear()} Justice Desk
      </div>
    </footer>
  );
}
