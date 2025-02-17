"use client";

import React, { useState } from "react";
import { useCookies } from "next-client-cookies";

export default function AuthBackground() {
  const Cookies = useCookies();

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
    "/images/bg11.webp",
    "/images/bg12.webp",
  ];

  const generateRandomNumber = (): number =>
    Math.floor(Math.random() * backgroundImages.length);

  const getBgImageFromCookie = (): number | undefined => {
    const savedBgImage = Cookies.get("bgImage");
    return savedBgImage ? parseInt(savedBgImage) : undefined;
  };

  const [bgImage] = useState<number>(() => {
    // Get the number saved as a cookie
    const savedBgImage = getBgImageFromCookie();
    if (
      savedBgImage !== undefined &&
      !isNaN(savedBgImage) &&
      savedBgImage >= 0 &&
      savedBgImage < backgroundImages.length
    )
      return savedBgImage;
    // Else, we will make a random number and set it
    else {
      const newBgImage = generateRandomNumber();
      Cookies.set("bgImage", newBgImage as unknown as string, {
        expires: 1 / 24,
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
      className="tablet:block absolute -z-10 hidden h-full w-full bg-cover bg-center bg-no-repeat"
      style={backgroundStyle}
    ></div>
  );
}
