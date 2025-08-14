import Hero from "./Hero";
import Hero2 from "./Hero2";
import Navbar from "./Navbar";

// components/Hero.tsx
export default function Home() {
  return (
    <div
      className="relative h-screen bg-center bg-no-repeat bg-cover"
      style={{
        backgroundImage: "url('/fixbs-bg.png')",
      }}
    >
      <div className="flex justify-center items-center">
        <Navbar />
      </div>

      <div className="flex flex-col items-center justify-center text-center h-2/3">
        <Hero />
      </div>

      <div className="mt-22">
        <Hero2 />
      </div>
    </div>
  );
}
