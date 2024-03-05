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
import { AuthProvider } from "@/auth";

interface AccountMenuProps {
  name: string;
  pictureURL: string;
  initials: string;
  email: string;
}

function AccountMenu(props: AccountMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={props.pictureURL}
              alt={"logged in as " + props.name}
            />
            <AvatarFallback>{props.initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-black" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{props.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {props.email}
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
        <DropdownMenuItem
          onClick={async () => {
            await AuthProvider.signout();
            // return redirect("/");
          }}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface TopBarProps {
  authStatus: JSX.Element;
}

function TopBar(props: TopBarProps) {
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
        {props.authStatus}
        <AccountMenu
          name={"Timmy Technician"}
          pictureURL={"sksks"}
          initials={"TT"}
          email={"timmy@lincoln.ac.uk"}
        />
      </div>
    </div>
  );
}

export default TopBar;
