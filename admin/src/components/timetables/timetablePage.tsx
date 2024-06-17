import * as React from "react";
import axios from "axios";
import { API_URL } from "@/constants";
import { getCookie } from "@/lib/cookie";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail } from "lucide-react";
import { Button } from "../ui/button";
import type { ITimetable } from "@/interfaces/timetable";
import TableList from "../theme/tableList";
import type { IEvent } from "@/interfaces/event";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  timetableId: string;
}

export function TimetablePage(props: Props) {
  const [timetable, setTimetable] = React.useState({} as ITimetable);
  const [events, setEvents] = React.useState([{} as IEvent]);
  const [friendsSpaceCode, setFriendsSpaceCode] = React.useState("");

  const fetchSpaceCodeForTimetableId = async (
    timetableId: string
  ): Promise<string> => {
    try {
      const response = await axios.get(
        API_URL + "/v2/timetable/" + timetableId,
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
          },
        }
      );
      return response.data.timetables[0].spaceCode;
    } catch (error) {
      console.error("There was an error!", error);
      return "Unknown";
    }
  };

  const fetchTimetableData = async () => {
    await axios
      .get(API_URL + "/v2/timetable/" + props.timetableId, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      })
      .then((response) => {
        setTimetable(response.data.timetables[0]);
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  };

  const fetchEventsData = async () => {
    await axios
      .get(API_URL + "/v2/timetable/" + props.timetableId + "/events", {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      })
      .then((response) => {
        setEvents(response.data.events);
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  };

  React.useEffect(() => {
    fetchTimetableData();
    fetchEventsData();

    if (timetable.canCombine) {
      const fetchSpaceCode = async () => {
        const code = await fetchSpaceCodeForTimetableId(
          timetable.combinedPartnerId
        );
        setFriendsSpaceCode(code);
      };
      fetchSpaceCode();
    }
  }, []);

  return (
    <div className="w-full text-xl flex flex-col items-center text-center p-10 pt-0">
      <div className="flex w-full justify-between">
        <div className="flex flex-col">
          <h1 className="text-3xl mb-5">
            <strong>{timetable.spaceCode}:</strong> {timetable.name}
          </h1>
          <ul className="text-left">
            <li>
              <strong>Capacity:</strong> {timetable.capacity}
            </li>
            <li>
              <strong>Can Combine:</strong>{" "}
              {timetable.canCombine ? (
                <span>
                  Yes with{" "}
                  <a
                    className="hover:underline"
                    href={`/timetables/${timetable.combinedPartnerId}`}
                  >
                    {friendsSpaceCode}
                  </a>
                </span>
              ) : (
                <span>No</span>
              )}
            </li>

            <li>
              <strong>Created:</strong>{" "}
              {new Date(timetable.creationDate).toLocaleDateString()}
            </li>
          </ul>
        </div>
        <div className="flex flex-col justify-around">
          <Button variant={"constructive"}>New Event</Button>
          <Button variant={"primaryOutline"}>Edit</Button>
          <Button variant={"primaryOutline"}>Edit</Button>
        </div>
      </div>
      <h2 className="my-5 text-3xl">Events</h2>
      <Tabs defaultValue="list" className="">
        <TabsList className="grid w-[200px] grid-cols-2">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <div className="relative overflow-x-auto tablet:shadow-md mt-5 rounded-xl">
            <TableList
              headers={["name", "moduleCode", "staff", "start", "end"]}
              data={events}
              urlBase="#"
            />
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="w-full">
           <h1>Not yet implemented!!!</h1>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
