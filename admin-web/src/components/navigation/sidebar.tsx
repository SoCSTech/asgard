import ULogo from "@/assets/logos/uol-white-text.svg";
import { Button } from "@/components/ui/button";

import { FaBeer } from "react-icons/fa";

function Sidebar() {
  return (
    <div className="flex flex-wrap md:flex-col flex-1 items-center h-full">
      <img
        src={ULogo}
        alt="University Logo"
        className="w-1/6 md:w-1/3 md:m-5 select-none md:mb-1 m-2"
      />
      <h1 className="text-3xl font-bold">
        asgard
      </h1>
      
      <div className="flex md:flex-col justify-center md:justify-between md:my-5 md:border-t md:border-t-1 md:pt-10">
        <Button className="md:mb-5" onClick={() => alert("pressed")}> <FaBeer /> boozeday button text</Button>

        <Button className="md:mb-5" onClick={() => alert("pressed")}>button text</Button>

        <Button className="md:mb-5" onClick={() => alert("pressed")}>button text</Button>
      </div>
    </div>
  );
}

export default Sidebar;
