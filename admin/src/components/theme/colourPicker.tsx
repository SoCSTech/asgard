import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const colours = [
  { name: "Apricot", hex: "#fcc05f" },
  { name: "Lavender", hex: "#b68ae5" },
  { name: "Salmon", hex: "#e38178" },
  { name: "Cyan", hex: "#59d5d9" },
  { name: "Mint", hex: "#7af58f" },
  { name: "Sky", hex: "#7ab4f5" },
  { name: "Blush", hex: "#cf8ba3" },
  { name: "Turquoise", hex: "#6af0ca" },
  { name: "Chartreuse", hex: "#bdc667" },
  { name: "Periwinkle", hex: "#a4a4cb" },
  { name: "Coral", hex: "#e58a92" },
  { name: "Lilac", hex: "#c293c8" },
  { name: "Frost", hex: "#d6fffe" },
  { name: "Slate", hex: "#a2aebb" },
  { name: "Tangerine", hex: "#ff9b71" },
  { name: "Azure", hex: "#40bfff" },
  { name: "Mango", hex: "#ff8040" },
  { name: "Violet", hex: "#c65aed" },
  { name: "Emerald", hex: "#81ed5a" },
  { name: "Amber", hex: "#f5e216" }
];

// Define a type for the colour map
interface ColourMap {
  [key: string]: string;
}

// Create a map for quick lookup of colour names by hex values
const colourMap: ColourMap = colours.reduce((acc: ColourMap, { name, hex }) => {
  acc[hex.toLowerCase()] = name;
  return acc;
}, {});

interface ColourSelectorProps {
  selectedColour: string;
  onChange: (value: string) => void;
  defaultColour: string;
}

const ColourSelector: React.FC<ColourSelectorProps> = ({
  selectedColour,
  onChange,
  defaultColour,
}) => {
  // Normalize selectedColour to lowercase or use defaultColour if none provided
  const normalizedSelectedColour =
    selectedColour?.toLowerCase() || defaultColour.toLowerCase();

  const handleChange = (value: string) => {
    // Convert value to lowercase
    const lowercaseValue = value.toLowerCase();
    // Check if value is in the list or custom
    if (colourMap[lowercaseValue]) {
      onChange(lowercaseValue);
    } else {
      console.error("No matching colour found for hex value: ${value}");
    }
  };

  return (
    <Select onValueChange={handleChange} value={normalizedSelectedColour}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a colour" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>{colourItems()}</SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default ColourSelector;

const colourItems = () => {
  return colours.map((colour) => (
    <SelectItem key={colour.hex} value={colour.hex}>
      <div className="flex items-center">
        <div
          className="h-5 w-5 mr-2 rounded-full border border-slate"
          style={{ backgroundColor: colour.hex }}
        ></div>
        {colour.name}
      </div>
    </SelectItem>
  ));
};