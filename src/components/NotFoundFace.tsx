"use client";

import { Poppins } from "next/font/google";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const poppins = Poppins({ subsets: ["latin"], weight: ["600"] });

// The "0" in "404" — a confused face with rotating eyes (the Sos Stays
// logo animation). Drop the exported file at public/lottie/404-face.lottie.
export function NotFoundFace() {
  return (
    <div className="flex items-center justify-center" aria-label="404">
      <span className={`${poppins.className} text-9xl text-forest-green sm:text-[12rem]`} aria-hidden>
        4
      </span>
      <DotLottieReact
        src="/lottie/404-face.lottie"
        loop
        autoplay
        className="-mx-8 h-40 w-40 sm:-mx-12 sm:h-60 sm:w-60"
      />
      <span className={`${poppins.className} text-9xl text-forest-green sm:text-[12rem]`} aria-hidden>
        4
      </span>
    </div>
  );
}
