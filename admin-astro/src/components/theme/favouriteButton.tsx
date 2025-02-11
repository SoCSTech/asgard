import React, { useState } from "react";
import { Heart, HeartCrack } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FavouriteButtonProps {
  onFavouriteChange: (isFavourite: boolean) => void;
  defaultValue: boolean;
}

const FavouriteButton: React.FC<FavouriteButtonProps> = ({
  onFavouriteChange,
  defaultValue,
}) => {
  const [isFavourite, setIsFavourite] = useState(defaultValue);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const toggleFavourite = () => {
    const newFavouriteStatus = !isFavourite;
    setIsFavourite(newFavouriteStatus);
    onFavouriteChange(newFavouriteStatus);
  };

  return (
    <Button
      variant="primaryOutline"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={toggleFavourite}
    >
      {isFavourite ? (
        isHovered ? (
          <HeartCrack />
        ) : (
          <Heart className="fill-black" />
        )
      ) : (
        <Heart />
      )}
    </Button>
  );
};

export default FavouriteButton;
