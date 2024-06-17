import React, { useState } from "react";
import Cookies from "js-cookie";

export default function SignedOutBackgroundLayer() {
  const backgroundImages: string[] = [
    "/images/bg1.webp",
    "/images/bg2.webp",
    "/images/bg3.webp",
    "/images/bg4.webp",
    "/images/bg5.webp",
    "/images/bg6.webp",
    "/images/bg7.webp",
    "/images/bg8.webp",
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

  const myImage: string = backgroundImages[bgImage];

  const backgroundStyle: React.CSSProperties = {
    backgroundImage: `url(${myImage})`,
  };

  return (
    <div
      className="w-full h-full absolute z-0 bg-cover bg-no-repeat"
      style={backgroundStyle}
    ></div>
  );
}
