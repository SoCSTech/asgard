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

export default function SearchPage() {
  const getQueryParam = (param: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  };

  const initialQuery = getQueryParam("q") || "";
  const [searchQuery, setSearchQuery] = React.useState(initialQuery);
  const [results, setResults] = React.useState({} as ISearchResults);

  React.useEffect(() => {
    if (searchQuery) {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `${API_URL}/v2/search/${searchQuery}`,
            {
              headers: {
                Authorization: `Bearer ${getCookie("token")}`,
              },
            }
          );
          setResults(response.data);
          console.log(results);
        } catch (error) {
          toast("A problem occurred while trying to search");

          console.error("There was a problem with the fetch operation:", error);
        }
      };

      fetchData();
    }
  }, [searchQuery]);

  const handleSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    // Update the URL with the new query
    window.history.pushState({}, "", `/search?q=${searchQuery}`);
    // Fetch new data based on the query
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/v2/search/${searchQuery}`,
          {
            headers: {
              Authorization: `Bearer ${getCookie("token")}`,
            },
          }
        );
        setResults(response.data);
        console.log(results);
        console.log(results.users);
      } catch (error) {
        toast("A problem occurred while trying to search");
        console.error("There was a problem with the fetch operation:", error);
      }
    };
    fetchData();
  };

  return (
    <div>
      <form
        className="flex align-middle items-center text-black w-screen px-10"
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
        <Button variant="primary">
          <Search className="stroke-white dark:stroke-black" />
        </Button>
      </form>

      {/* LOADS OF TABLES HERE!!! */}
      <h2>Timetables</h2>
      {/* <TableList
        headers={["spaceCode", "name", "capacity", "dataSource"]}
        data={results.timetables}
        urlBase="/timetables"
      /> */}
    </div>
  );
}
