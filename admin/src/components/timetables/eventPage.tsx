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
import { toast } from "sonner";

interface Props {
  eventId: string;
}

export function EventPage(props: Props) {
  const [event, setEvent] = React.useState({} as IEvent);

  const fetchEventData = async () => {
    await axios
      .get(API_URL + "/v2/event/" + props.eventId, {
        
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      })
      .then((response) => {
        setEvent(response.data.events[0]);

        if (response.data.events.length == 0) {
          toast("No event found");
        }
      })
      .catch((error) => {
        console.error("There was an error!", error);
        toast(error.message);
      });
  };

  React.useEffect(() => {
    fetchEventData();
  }, []);

  return (
    <div className="w-full text-xl flex flex-col items-center text-center p-10 pt-0">
      <div className="flex w-full justify-between">
        <div className="flex flex-col">
          <h1 className="text-3xl mb-5">
            <strong>{event.name}</strong>
          </h1>
          <ul className="text-left">
            <li>{/* <strong>Capacity:</strong> {timetable.capacity} */}</li>

            <li>
              <strong>Data Source:</strong>{" "}
              {/* {formatEnumValue(String(timetable.dataSource))} */}
            </li>
          </ul>
        </div>
        <div className="flex flex-col justify-evenly">
          {/* {newEventWindow()} */}
          <Button variant={"primaryOutline"}>Edit</Button>
        </div>
      </div>
    </div>
  );
}
