import { Button } from "@/components/ui/button";

import { FaBeer } from "react-icons/fa";

function Sidebar() {
  return (
    <div className="flex flex-wrap md:flex-col flex-1 items-center h-full">
     
      
      <div className="flex md:flex-col justify-center md:justify-between md:my-5 md:border-t md:border-t-1 md:pt-10">
        <Button className="md:mb-5" onClick={() => alert("pressed")}> <FaBeer /> boozeday button text</Button>

        <Button className="md:mb-5" onClick={() => alert("pressed")}>button text</Button>

        <Button className="md:mb-5" onClick={() => alert("pressed")}>button text</Button>
      </div>
    </div>
  );
}

export default Sidebar;
