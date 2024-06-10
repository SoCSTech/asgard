import * as React from "react";
import axios from "axios";
import { API_URL } from "@/constants";
import { getCookie } from "@/lib/cookie";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { IUser } from "@/interfaces/user";
import { HeaderLink, HeaderLinkGroup } from "./headerLink";

import { LogOut } from "lucide-react";

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
        console.log(user);
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <header className="bg-black tablet:grid tablet:grid-rows-1 tablet:grid-cols-3 pb-5 tablet:pb-2 py-2 px-5 text-white rounded-b-xl tablet:rounded-none mb-5 drop-shadow-md">
      <div className="ml-2 mt-2 tablet:m-0">
        <a href="/" className="flex items-center">
          <img
            className="w-10 h-10"
            src="/images/logos/uol-white.svg"
            alt="University of Lincoln"
            draggable="false"
          />
          <span className="hover:text-slate font-bold ml-5 text-xl">
            Asgard
          </span>
        </a>
      </div>

      <HeaderLinkGroup>
        <HeaderLink href="/timetables">Timetables</HeaderLink>
        <HeaderLink href="/groups">Groups</HeaderLink>
        <HeaderLink href="/carousels">Carousels</HeaderLink>
      </HeaderLinkGroup>

      <div className="hidden tablet:flex tablet:justify-end justify-center items-center">
        <span className="tablet:mr-5">
          Hi,{" "}
          <a
            className="underline hover:no-underline hover:text-slate"
            href="/settings"
          >
            {user.shortName}
          </a>
          !
        </span>

        <a href="/settings">
          <Avatar>
            <AvatarImage
              src={user.profilePictureUrl}
              alt={"Logged in as " + user.fullName}
            />
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>
        </a>

        <a href="/logout" className="tablet:ml-5 text-xs hover:text-slate">
          <LogOut />
        </a>
      </div>
    </header>
  );
}
