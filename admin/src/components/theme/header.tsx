import * as React from "react";
import axios from "axios";
import { API_URL } from "@/constants";
import { getCookie } from "@/lib/cookie";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { IUser } from "@/interfaces/user";
import { HeaderLink, HeaderLinkGroup } from "./headerLink";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ChevronDown, User } from "lucide-react";

export default function Header() {
  const [user, setUser] = React.useState({} as IUser);

  const fetchData = async () => {
    await axios
      .get(API_URL + "/v2/user/me", {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      })
      .then((response) => {
        setUser(response.data.users[0] as IUser);
        if (response.data.users.length == 0) {
          toast("Authentication failure");
        }
      })
      .catch((error) => {
        console.error("There was an error!", error);
        toast(error.message);
      });
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <header className="bg-black dark:bg-muted tablet:grid tablet:grid-rows-1 tablet:grid-cols-3 pb-5 tablet:pb-2 py-2 px-5 text-white rounded-b-xl tablet:rounded-none mb-5 drop-shadow-md">
      <div className="ml-2 mt-2 tablet:m-0 h-full">
        <a href="/" className="flex items-center h-full">
          <img
            className="w-10 h-10"
            src="/images/logos/uol-white.svg"
            alt="University of Lincoln"
            draggable="false"
          />
          <span className="hover:text-gray-400 font-bold ml-5 text-xl">
            Asgard
          </span>
        </a>
      </div>

      <HeaderLinkGroup href={""}>
        <HeaderLink href="/timetables">Timetables</HeaderLink>
        <HeaderLink href="/groups">Groups</HeaderLink>
        <HeaderLink href="/desks">Desks</HeaderLink>
        <HeaderLink href="/users">Users</HeaderLink>
      </HeaderLinkGroup>

      <Collapsible className="tablet:hidden">
        <CollapsibleTrigger className="flex flex-col items-center w-full">
          <ChevronDown size={25} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul>
            <HeaderLink href="/timetables">Timetables</HeaderLink>
            <HeaderLink href="/groups">Groups</HeaderLink>
            <HeaderLink href="/desks">Desks</HeaderLink>
            <HeaderLink href="/users">Users</HeaderLink>
            <HeaderLink href="/search">Search</HeaderLink>

            <HeaderLink href="/settings">
              <div className="flex px-2 py-1 mt-4 rounded-xl">
                <User className="mr-2" /> {user.fullName}
              </div>
            </HeaderLink>
          </ul>
        </CollapsibleContent>
      </Collapsible>

      <div className="hidden tablet:flex tablet:justify-end justify-center items-center">
        <form
          className="flex align-middle items-center text-black"
          action="/search"
        >
          <Input
            type="text"
            placeholder="Search timetables, events, groups, and users"
            name="q"
          />
        </form>

        <a href="/settings" className="ml-5">
          <Avatar>
            <AvatarImage
              src={user.profilePictureUrl}
              alt={"Logged in as " + user.fullName}
            />
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>
        </a>
      </div>
    </header>
  );
}
