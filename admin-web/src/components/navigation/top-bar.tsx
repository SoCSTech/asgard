import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import ULogo from "@/assets/logos/uol-white-text.svg";

function AccountMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src="https://github.com/cooperj.png"
              alt="picture of josh"
            />
            <AvatarFallback>JC</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-black" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Josh Cooper</p>
            <p className="text-xs leading-none text-muted-foreground">
              joshcooper@lincoln.ac.uk
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>New Team</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TopBar() {
  return (
    <div className="sm:p-8 lg:p-12 flex items-center justify-stretch">
      <div className="flex flex-1 items-start">
        <img
          src={ULogo}
          alt="University Logo"
          className="w-[75px] select-none mr-16"
        />
        <div className="flex flex-col">
          <h2 className="text-xl">School of Computer Science</h2>
          <h1 className="text-5xl font-bold">asgard</h1>
        </div>
      </div>

      <div className="flex items-center">
        <span className="pr-6 text-l">Hi, Josh Cooper</span>
        <AccountMenu />
      </div>
    </div>
  );
}

export default TopBar;
