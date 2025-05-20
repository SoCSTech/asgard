"use client";

import React, { useState } from "react";
import {
  getCookie,
  setCookie
} from "cookies-next/client";

export default function AuthBackground() {
  const backgroundImages: string[] = [
    "/images/bg1.webp",
    "/images/bg2.webp",
    "/images/bg3.webp",
    "/images/bg4.webp",
    "/images/bg5.webp",
    "/images/bg6.webp",
    "/images/bg7.webp",
    "/images/bg8.webp",
    "/images/bg9.webp",
    "/images/bg10.webp",
  ];

  const generateRandomNumber = (): number =>
    Math.floor(Math.random() * backgroundImages.length);

  const getBgImageFromCookie = (): number | undefined => {
    const savedBgImage = getCookie("bgImage");
    console.log(savedBgImage);
    return savedBgImage ? parseInt(savedBgImage) : undefined;
  };

  const [bgImage] = useState<number>(() => {
    // Get the number saved as a cookie
    const savedBgImage = getBgImageFromCookie();
    if (savedBgImage) return savedBgImage;
    // Else, we will make a random number and set it
    else {
      const newBgImage = generateRandomNumber();
      setCookie("bgImage", newBgImage as unknown as string, {
        maxAge: 3600,
      }); // 1 hour expiration

      return newBgImage;
    }
  });

  const myImage: string = backgroundImages[bgImage] || "/images/bg1.webp";

  const backgroundStyle: React.CSSProperties = {
    backgroundImage: `url(${myImage})`,
  };

  return (
    <div
      suppressHydrationWarning
      className="absolute -z-10 hidden h-full w-full bg-cover bg-center bg-no-repeat tablet:block"
      style={backgroundStyle}
    ></div>
  );
}
