"use client";
import * as React from "react";
import axios from "axios";
import { useCookies } from "next-client-cookies";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { IUser } from "@/interfaces/user";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface HeaderLinkProps {
  children?: React.ReactNode;
  href: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export function HeaderLink(props: HeaderLinkProps) {
  const currentSection = window.location.pathname.split("/")[1];
  const buttonSection = props.href.split("/")[1];

  if (currentSection === buttonSection) {
    return (
      <li className="tablet:text-md tablet:my-0 tablet:mr-5 tablet:px-1 tablet:underline tablet:bg-inherit tablet:text-white my-1 rounded bg-white px-2 text-xl text-black hover:bg-accent hover:text-accent-foreground">
        <a href={props.href}>{props.children}</a>
      </li>
    );
  } else {
    return (
      <li className="tablet:text-md tablet:my-0 tablet:mr-5 tablet:px-1 my-1 rounded px-2 text-xl hover:bg-accent hover:text-accent-foreground">
        <a href={props.href}>{props.children}</a>
      </li>
    );
  }
}

export function HeaderLinkGroup({ children }: HeaderLinkProps) {
  return (
    <ul className="tablet:flex tablet:flex-row tablet:items-center tablet:justify-center tablet:text-base tablet:my-0 my-5 hidden flex-col text-3xl">
      {children}
    </ul>
  );
}

import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ChevronDown, User } from "lucide-react";

export default function Header() {
  const Cookies = useCookies();
  const [user, setUser] = React.useState({} as IUser);

  const fetchData = async () => {
    await axios
      .get("/v2/user/me", {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
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
    <header className="tablet:grid tablet:grid-rows-1 tablet:grid-cols-3 tablet:pb-2 tablet:rounded-none mb-5 rounded-b-xl bg-black px-5 py-2 pb-5 text-white drop-shadow-md dark:bg-muted">
      <div className="tablet:m-0 ml-2 mt-2 h-full">
        <a href="/" className="flex h-full items-center">
          <img
            className="h-10 w-10"
            src="/images/logos/uol-white.svg"
            alt="University of Lincoln"
            draggable="false"
          />
          <span className="ml-5 text-xl font-bold hover:text-gray-400">
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
        <CollapsibleTrigger className="flex w-full flex-col items-center">
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
              <div className="mt-4 flex rounded-xl px-2 py-1">
                <User className="mr-2" /> {user.fullName}
              </div>
            </HeaderLink>
          </ul>
        </CollapsibleContent>
      </Collapsible>

      <div className="tablet:flex tablet:justify-end hidden items-center justify-center">
        <form
          className="flex items-center align-middle text-black"
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
