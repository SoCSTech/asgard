"use client";
import * as React from "react";
import axios from "axios";
import { getCookie, deleteCookie } from "cookies-next/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { IUser } from "@/interfaces/user";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ChevronDown,
  BookOpenText,
  Users,
  Search,
  LayoutDashboard,
  ListVideo,
} from "lucide-react";

const ICON_SIZE = 20;
const ADMIN_TOKEN_COOKIE_NAME = "admin_token";
const USER_API_ENDPOINT = "/v2/user/me";

const navLinks = [
  { href: "/", icon: <BookOpenText size={ICON_SIZE} />, label: "Timetables" },
  {
    href: "/carousels",
    icon: <LayoutDashboard size={ICON_SIZE} />,
    label: "Carousels",
  },
  { href: "/playlists",
    icon: <ListVideo size={ICON_SIZE} />,
    label: "Playlists",
  },
  { href: "/users", icon: <Users size={ICON_SIZE} />, label: "People" },
];

interface HeaderLinkProps {
  children?: React.ReactNode;
  href: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  icon?: React.ReactNode;
}

export function HeaderLink(props: HeaderLinkProps) {
  return (
    <li className="tablet:text-md my-1 flex items-center rounded px-2 text-xl hover:bg-accent hover:text-accent-foreground tablet:my-0 tablet:mr-5 tablet:px-1">
      <a href={props.href} className="flex items-center">
        {props.icon && <span className="mr-2">{props.icon}</span>}
        {props.children}
      </a>
    </li>
  );
}

export function HeaderLinkGroup({ children }: { children: React.ReactNode }) {
  return (
    <ul className="my-5 hidden flex-col text-3xl tablet:my-0 tablet:flex tablet:flex-row tablet:items-center tablet:justify-center tablet:text-base">
      {children}
    </ul>
  );
}

export default function Header() {
  const [user, setUser] = React.useState<IUser | null>(null);
  const [searchVisible, setSearchVisible] = React.useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    // Wrapped in useCallback
    const token = getCookie(ADMIN_TOKEN_COOKIE_NAME);
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const response = await axios.get(USER_API_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (
        response.data &&
        Array.isArray(response.data.users) &&
        response.data.users.length > 0
      ) {
        setUser(response.data.users[0] as IUser);
      } else {
        toast("Authentication failure: No user data received.");
        deleteCookie(ADMIN_TOKEN_COOKIE_NAME);
        setUser(null);
      }
    } catch (error: any) {
      console.error("There was an error fetching user data!", error);
      let errorMessage = "Failed to fetch user data.";
      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Network error while fetching user data.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast(errorMessage);
      deleteCookie(ADMIN_TOKEN_COOKIE_NAME); // Ensure cookie is deleted on error
      setUser(null); // Clear user state on error
    }
  }, []); // No dependencies needed as getCookie, setUser, toast, deleteCookie are stable or from outside

  React.useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData is now a stable dependency

  return (
    <header className="mb-5 rounded-b-xl px-5 py-2 pb-5 text-white drop-shadow-md tablet:grid tablet:grid-cols-3 tablet:grid-rows-1 tablet:rounded-none tablet:pb-2">
      {/* Logo and Site Name */}
      <div className="ml-2 mt-2 h-full tablet:m-0">
        <a href="/" className="flex h-full items-center">
          <img
            className="h-8   w-8"
            src="/images/logos/uol-white.svg"
            alt="University of Lincoln"
            draggable="false"
          />
          <span className="ml-5 text-xl font-bold hover:text-gray-400">
            Asgard
          </span>
        </a>
      </div>

      {/* Desktop Navigation */}
      <HeaderLinkGroup>
        {navLinks.map((link) => (
          <HeaderLink key={link.href} href={link.href} icon={link.icon}>
            {link.label}
          </HeaderLink>
        ))}
      </HeaderLinkGroup>

      {/* Right-side elements (Search and User Avatar for Desktop) */}
      <div className="hidden items-center justify-center tablet:flex tablet:justify-end">
        <form
          className={`flex items-center align-middle text-black transition-all duration-300 ${
            searchVisible ? "w-64" : "w-0 overflow-hidden"
          }`}
          action="/search" // Assumes server-side handling or full page redirect for search
        >
          <Input
            type="text"
            placeholder="Search timetables, events, groups, and users"
            name="q"
            className="text-white transition-all duration-300" // Ensure this text color is visible on input background
          />
        </form>

        <button
          className="ml-2 rounded p-2 text-white hover:bg-gray-700"
          onClick={() => setSearchVisible(!searchVisible)}
          aria-label="Toggle search bar" // Added aria-label for accessibility
        >
          <Search size={ICON_SIZE} />
        </button>

        {user && ( // Conditionally render avatar if user exists
          <a href="/settings" className="ml-5">
            <Avatar>
              <AvatarImage
                src={user.profilePictureUrl} // Safe now due to the `user &&` check above
                alt={"Logged in as " + user.fullName}
              />
              <AvatarFallback>{user.initials}</AvatarFallback>
            </Avatar>
          </a>
        )}
      </div>

      {/* Mobile Navigation (Collapsible) - This should be outside the desktop right-side elements div */}
      {/* and ideally structured correctly if it's part of the grid or a separate flow item */}
      {/* For simplicity, I'm placing it here. You might need to adjust its exact position in the grid/flex layout. */}
      <div className="tablet:hidden">
        {" "}
        {/* Wrapper to ensure it's only for mobile */}
        <Collapsible onOpenChange={setIsMobileNavOpen}> 
          <CollapsibleTrigger className="flex w-full flex-col items-center pt-3">
            <ChevronDown
              size={25}
              className={`${isMobileNavOpen ? "rotate-180" : ""} transition-transform duration-300`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="mt-2">
              {" "}
              {/* Added some margin-top for spacing */}
              {navLinks.map((link) => (
                <HeaderLink key={link.href} href={link.href} icon={link.icon}>
                  {link.label}
                </HeaderLink>
              ))}
              {/* User specific link for mobile */}
              {user && (
                <HeaderLink href="/settings">
                  <div className="mt-4 flex items-center rounded-xl px-2 py-1">
                    {" "}
                    {/* Ensure items-center for alignment */}
                    <Avatar className="mr-2 h-8 w-8">
                      {" "}
                      {/* Smaller avatar for mobile menu */}
                      <AvatarImage
                        src={user.profilePictureUrl}
                        alt={user.fullName}
                      />
                      <AvatarFallback>{user.initials}</AvatarFallback>
                    </Avatar>
                    {user.fullName}
                  </div>
                </HeaderLink>
              )}
              {!user && ( // Optional: Show a login link or placeholder if user is not logged in on mobile
                <HeaderLink href="/login">Login</HeaderLink>
              )}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </header>
  );
}
