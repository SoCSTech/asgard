import * as React from "react";
import axios from "axios";
import { API_URL } from "@/constants";
import { getCookie } from "@/lib/cookie";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, Mail } from "lucide-react";
import { Button } from "../ui/button";
import type { ITimetable } from "@/interfaces/timetable";
import TableList from "../theme/tableList";
import type { IEvent } from "@/interfaces/event";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { formatEnumValue } from "@/lib/enum";

interface Props {
  timetableId: string;
}

export function TimetablePage(props: Props) {
  const [timetable, setTimetable] = React.useState({} as ITimetable);
  const [events, setEvents] = React.useState([{} as IEvent]);

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
  }, []);

  const newEventWindow = () => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant={"constructive"}>New Event</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share link</DialogTitle>
            <DialogDescription>
              Anyone who has this link will be able to view this.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input
                id="link"
                defaultValue="https://ui.shadcn.com/docs/installation"
                readOnly
              />
            </div>
            <Button type="submit" size="sm" className="px-3">
              <span className="sr-only">Copy</span>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

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
                    {timetable.combinedPartnerSpaceCode}
                  </a>
                </span>
              ) : (
                <span>No</span>
              )}
            </li>

            <li>
              <strong>Data Source:</strong>{" "}
              {formatEnumValue(String(timetable.dataSource))}
            </li>
          </ul>
        </div>
        <div className="flex flex-col justify-evenly">
          {newEventWindow()}
          <Button variant={"primaryOutline"}>Edit</Button>
        </div>
      </div>
      <h2 className="my-5 text-3xl w-full text-left">Events</h2>
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-[200px] grid-cols-2">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <div className="relative overflow-x-auto tablet:shadow-md mt-5 rounded-xl w-full">
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
            <p>
              Calendar view is gonna be a little bit more tricky so its not been
              done yet. But fear not it will be done soon :P
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
