"use client";

import Navbar from "@/components/Navbar";
import React, { FormEvent, useState } from "react";

function page() {
  const [wishlistToggle, setWishlistToggle] = useState(false);
  const [wishlistMsg, setWishlistMsg] = useState("");

  async function addWishlist(
    name: FormDataEntryValue,
    email: FormDataEntryValue,
  ) {
    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        body: JSON.stringify({ name, email }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        console.log("Wishlist Successful");
        setWishlistToggle(true);
      }

      const result = await response.json();
      setWishlistMsg(result.message);
    } catch (error) {
      console.error("Wishlist Error: ", error);
    }
  }
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");

    if (name && email) {
      addWishlist(name, email);
    }
  }

  return (
    <div
      className="relative h-screen bg-center bg-no-repeat bg-cover"
      style={{ backgroundImage: "url('/fixbs-bg.png')" }}
    >
      <div
    //   className="relative h-screen bg-center bg-no-repeat bg-cover"
    //   style={{
    //     backgroundImage: "url('/fixbs-bg.png')",
    //   }}
      >
        <div className="flex justify-center items-center">
          <Navbar />
        </div>

        <div className="text-center text-white mt-10">
          <h1 className="text-5xl lg:text-6xl font-bold p-1">
            Fill the form{" "}
            <span className="text-[#5CC8FF]">
              {" "}
              <i> to Wishlist </i>{" "}
            </span>{" "}
            <span className="underline"></span>
          </h1>
          <p className="mt-4 text-lg lg:text-2xl font-semibold italic">
            You'll receive an email invitation to be the
            <span className="underline"> First User! </span>
          </p>
        </div>

        <div className="flex justify-center items-center">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 max-w-md p-4 mt-8 bg-transparent border-2 border-gray-50 rounded-xl w-4/5 py-4 px-4 backdrop-blur-lg text-white"
          >
            <div>
              <label htmlFor="message" className="block text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="border p-2 rounded w-full"
              />
            </div>

            <button
              type="submit"
              className="mt-8 px-6 py-3 lg:px-10 lg:py-4 bg-[#5CC8FF] cursor-pointer text-white hover:text-[#FFEC9F] rounded-lg text-xl font-semibold hover:bg-[#4AB0E6] transition duration-300 inline-block"
            >
              Submit Form
            </button>
          </form>
        </div>

        <div>
          <footer className="w-full text-center py-4 text-white bg-blue-950 bg-opacity-10 backdrop-blur-lg mt-8">
            &copy; {new Date().getFullYear()} FixBS. All rights reserved.
          </footer>
        </div>

        {wishlistToggle && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-8 rounded shadow-md text-center">
              <h2 className="text-xl font-bold mb-4">{wishlistMsg}</h2>
              <p className="text-gray-700">
                Thank you for adding to your wishlist!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default page;
