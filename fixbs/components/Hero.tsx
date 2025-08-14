import Link from "next/link";
import React from "react";

function Hero() {
  return (
    <div>
      <div className="text-center text-white mt-10">
        <h1 className="text-6xl font-bold">
          AI wrote <span className="text-[#5CC8FF]"> BS Code </span> for{" "}
          <span className="underline"> you? </span>
        </h1>
        <p className="mt-4 text-2xl font-semibold italic">
          Fix it using <span className="underline"> FixBS </span>
        </p>
        <Link
          href="/dashboard"
          className="mt-8 px-18 py-4 bg-[#5CC8FF] cursor-pointer text-white hover:text-[#FFEC9F] rounded-lg text-2xl font-semibold hover:bg-[#4AB0E6] transition duration-300 inline-block"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}

export default Hero;
