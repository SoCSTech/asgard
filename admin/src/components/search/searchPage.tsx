import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import TableList from "@/components/theme/tableList";
import { API_URL } from "@/constants";
import { toast } from "sonner";
import axios from "axios";
import { getCookie } from "@/lib/cookie";
import type { ITimetableGroup } from "@/interfaces/timetableGroup";
import type { ITimetable } from "@/interfaces/timetable";
import type { IEvent } from "@/interfaces/event";
import type { IUser } from "@/interfaces/user";

interface ISearchResults {
  query: string;
  timetables: ITimetable[];
  groups: ITimetableGroup[];
  events: IEvent[];
  users: IUser[];
}

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SearchPage() {
  const getQueryParam = (param: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  };

  const initialQuery = getQueryParam("q") || "";
  const [searchQuery, setSearchQuery] = React.useState(initialQuery);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [results, setResults] = React.useState({} as ISearchResults);

  const fetchData = async (query: string) => {
    if (query) {
      window.history.pushState({}, "", `/search?q=${query}`);
      try {
        const response = await axios.get(`${API_URL}/v2/search/${query}`, {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
          },
        });
        setResults(response.data);
      } catch (error) {
        toast("A problem occurred while trying to search");
        console.error("There was a problem with the fetch operation:", error);
      }
    }
  };

  React.useEffect(() => {
    fetchData(debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  const handleSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    fetchData(searchQuery);
  };

  return (
    <div className="mb-auto pb-10 tablet:mx-20 w-full max-w-[1500px] self-center">
      <div className="mb-5" id="search-form">
        <form
          className="flex align-middle items-center text-black px-10"
          onSubmit={handleSubmit}
        >
          <Input
            type="text"
            placeholder="Search timetables, events, groups, and users"
            name="q"
            className="mr-5"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="primary" type="submit">
            <Search className="stroke-white dark:stroke-black" />
          </Button>
        </form>
      </div>

      <div className="mb-5">
        <h2 className="text-2xl font-extrabold text-center">Timetables</h2>
        <div className="relative overflow-x-auto tablet:shadow-md mt-5 rounded-xl">
          <TableList
            headers={["spaceCode", "name", "capacity", "dataSource"]}
            data={results.timetables}
            urlBase="/timetables"
          />
        </div>
      </div>
      <div className="mb-5">
        <h2 className="text-2xl font-extrabold text-center">Groups</h2>
        <div className="relative overflow-x-auto tablet:shadow-md mt-5 rounded-xl">
          <TableList
            headers={["internalName", "name", "subtitle"]}
            data={results.groups}
            urlBase="/groups"
          />
        </div>
      </div>
      <div className="mb-5">
        <h2 className="text-2xl font-extrabold text-center">Users</h2>
        <div className="relative overflow-x-auto tablet:shadow-md mt-5 rounded-xl">
          <TableList
            headers={["fullName", "username", "email", "role"]}
            data={results.users}
            urlBase="/users"
          />
        </div>
      </div>
      <div className="mb-5">
        <h2 className="text-2xl font-extrabold text-center">Events</h2>
        <div className="relative overflow-x-auto tablet:shadow-md mt-5 rounded-xl">
          <TableList
            headers={["name", "moduleCode", "staff", "start", "end"]}
            data={results.events}
            urlBase="/events"
          />
        </div>
      </div>
    </div>
  );
}
