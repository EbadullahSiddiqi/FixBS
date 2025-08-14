import Link from "next/link";
import React from "react";

function Navbar() {
  return (
    <nav className="mt-12 bg-transparent border-2 border-gray-50 rounded-xl w-2/3 py-4 px-4 backdrop-blur-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">FixBS</h1>
        <div className="flex gap-3 space-x-4 text-white text-lg font-semibold">
          <Link
            className="hover:text-[#FFEC9F] transition-all duration-200"
            href="/"
          >
            Home
          </Link>
          <Link
            className="hover:text-[#FFEC9F] transition-all duration-200"
            href="/about"
          >
            About
          </Link>
          <Link
            className="hover:text-[#FFEC9F] transition-all duration-200"
            href="/contact"
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
