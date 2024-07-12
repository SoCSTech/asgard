import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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
  { name: "Amber", hex: "#f5e216" },
  { name: "Custom", hex: "custom" },
];

const colourItems = () => {
  return colours.map((colour) => (
    <SelectItem key={colour.hex} value={colour.hex}>
      <div className="flex">
        <div
          className="h-5 w-5 mr-5 rounded-full border border-slate"
          style={{ backgroundColor: colour.hex }}
        ></div>
        {colour.name}
      </div>
    </SelectItem>
  ));
};

interface ColourSelectorProps {
  selectedColour: string;
  onChange: (value: string) => void;
}

const ColourSelector: React.FC<ColourSelectorProps> = ({
  selectedColour,
  onChange,
}) => {
  const [isCustom, setIsCustom] = React.useState(false);

  const handleChange = (value: string) => {
    if (value === "custom") {
      setIsCustom(true);
      onChange(""); // Clear the value when "Custom" is selected
    } else {
      setIsCustom(false);
      onChange(value);
    }
  };

  const handleCustomColorChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange(event.target.value);
  };

  return (
    <>
      <Select onValueChange={handleChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a colour" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>{colourItems()}</SelectGroup>
        </SelectContent>
      </Select>

      {isCustom && (
        <Input
          type="color"
          value={selectedColour}
          onChange={handleCustomColorChange}
        />
      )}
    </>
  );
};

export default ColourSelector;
