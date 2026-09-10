"use client";

// import { signIn } from "@/auth";
import { signIn, signOut, useSession } from "next-auth/react";
import { Github } from "lucide-react";
import Link from "next/link";

function Navbar() {
  const { data: session } = useSession();

  if (session) {
    console.log(session.accessToken);
  }
  return (
    <nav className="mt-12 bg-transparent border-2 border-gray-50 rounded-xl w-4/5 lg:w-2/3 py-4 px-4 backdrop-blur-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-xl lg:text-2xl font-bold">
          FixBS
        </Link>
        <div className="flex gap-3 space-x-4 text-white text-lg font-semibold">
          {/* <Link
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
          </Link> */}
          {!session ? (
            <form
              action={() => {
                signIn("github");
              }}
            >
              <button type="submit">
                Signin <Github />
              </button>
            </form>
          ) : (
            <form
              action={() => {
                signOut();
              }}
            >
              <button type="submit">Signout</button>
            </form>
          )}

          <h1 className="hover:text-[#FFEC9F] transition-all duration-200 text-lg lg:text-xl">
            <i> Coming Soon </i>
          </h1>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
