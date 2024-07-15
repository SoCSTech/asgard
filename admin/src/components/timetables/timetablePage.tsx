import * as React from "react";
import axios from "axios";
import { API_URL, Y2_URL } from "@/constants";
import { getCookie } from "@/lib/cookie";
import { Button } from "../ui/button";
import type { ITimetable } from "@/interfaces/timetable";
import TimetableEventsTableList from "@/components/timetables/timetableEventsTableList";
import type { IEvent } from "@/interfaces/event";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatEnumValue } from "@/lib/enum";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ColourSelector from "../theme/colourPicker";

const eventTypes = [
  { label: "Other", value: "OTHER" },
  { label: "Workshop", value: "WORKSHOP" },
  { label: "Lecture", value: "LECTURE" },
  { label: "Social", value: "SOCIAL" },
  { label: "Maintenance", value: "MAINTENANCE" },
  { label: "Exam", value: "EXAM" },
  { label: "Project", value: "PROJECT" },
];

interface Props {
  timetableId: string;
}

const EventFormSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(128),
  staff: z.string(),
  moduleCode: z.string(),
  type: z.string(),
  colour: z.string().length(7, {
    message:
      "Select a colour from the list or select custom and enter a specific colour",
  }),
  date: z.string(),
  start: z.string(),
  end: z.string(),
  isCombinedSession: z.boolean(),
  group: z.string().max(10),
  externalId: z.string().max(128),
});

export function TimetablePage(props: Props) {
  const [timetable, setTimetable] = React.useState<ITimetable>(
    {} as ITimetable
  );
  const [events, setEvents] = React.useState<IEvent[]>([]);
  const [eventSheetIsOpen, setEventSheetIsOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<IEvent | null>(null);

  const fetchTimetableData = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/v2/timetable/${props.timetableId}`,
        {
          headers: { Authorization: `Bearer ${getCookie("token")}` },
        }
      );
      const timetables = response.data.timetables;
      if (timetables.length === 0) {
        toast("No timetables found");
      } else {
        setTimetable(timetables[0]);
      }
    } catch (error) {
      console.error("There was an error!", error);
      toast(error.message);
    }
  };

  const fetchEventsData = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/v2/timetable/${props.timetableId}/events`,
        {
          headers: { Authorization: `Bearer ${getCookie("token")}` },
        }
      );
      const events = response.data.events;
      if (events.length === 0) {
        toast("No events found");
      } else {
        setEvents(events);
      }
    } catch (error) {
      console.error("There was an error!", error);
      toast(error.message);
    }
  };

  React.useEffect(() => {
    fetchTimetableData();
    fetchEventsData();
  }, []);

  const handleEventSubmit = async (data: z.infer<typeof EventFormSchema>) => {
    try {
      if (selectedEvent) {
        // Update existing event
        await axios.put(
          `${API_URL}/v2/event/${selectedEvent.id}`,
          {
            ...data,
            timetableId: props.timetableId,
            start: `${data.date} ${data.start}`,
            end: `${data.date} ${data.end}`,
          },
          {
            headers: { Authorization: `Bearer ${getCookie("token")}` },
          }
        );
        toast("Event updated!");
      } else {
        // Create new event
        await axios.post(
          `${API_URL}/v2/event`,
          {
            ...data,
            timetableId: props.timetableId,
            start: `${data.date} ${data.start}`,
            end: `${data.date} ${data.end}`,
          },
          {
            headers: { Authorization: `Bearer ${getCookie("token")}` },
          }
        );
        toast("New event created!");
      }
      fetchEventsData();
      setEventSheetIsOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error("There was an error!", error);
      toast(error?.response?.data?.message || "Couldn't save the event");
    }
  };

const newEventForm = (event: IEvent | null) => {
  const form = useForm<z.infer<typeof EventFormSchema>>({
    resolver: zodResolver(EventFormSchema),
    defaultValues: {
      id: event?.id || "",
      name: event?.name || "",
      staff: event?.staff || "",
      moduleCode: event?.moduleCode || "",
      type: event?.type || "OTHER",
      colour: event?.colour || "",
      date: event
        ? new Date(event.start).toISOString().substring(0, 10)
        : new Date().toISOString().substring(0, 10),
      start: event ? new Date(event.start).toISOString().substring(11, 16) : "",
      end: event ? new Date(event.end).toISOString().substring(11, 16) : "",
      isCombinedSession: event?.isCombinedSession || false,
      group: event?.group || "",
      externalId: event?.externalId || "",
    },
  });

  React.useEffect(() => {
    if (event) {
      form.reset({
        id: event.id,
        name: event.name,
        staff: event.staff,
        moduleCode: event.moduleCode,
        type: event.type,
        colour: event.colour,
        date: new Date(event.start).toISOString().substring(0, 10),
        start: new Date(event.start).toISOString().substring(11, 16),
        end: new Date(event.end).toISOString().substring(11, 16),
        isCombinedSession: event.isCombinedSession,
        group: event.group,
        externalId: event.externalId,
      });
    } else {
      form.reset({
        id: "",
        name: "",
        staff: "",
        moduleCode: "",
        type: "OTHER",
        colour: "",
        date: new Date().toISOString().substring(0, 10),
        start: "",
        end: "",
        isCombinedSession: false,
        group: "",
        externalId: "",
      });
    }
  }, [event]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleEventSubmit)}
        className="space-y-6 px-1"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Name<span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                This is the name for the event displayed on the screens.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="moduleCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Module Code</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="staff"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Staff</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>
                Type<span className="text-destructive">*</span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {eventTypes.map((eventType) => (
                      <SelectItem key={eventType.value} value={eventType.value}>
                        {eventType.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormDescription>
                The types allow Yggdrasil to show different icons and act in
                different ways.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="colour"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Colour<span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <ColourSelector
                  selectedColour={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input {...field} type="date" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="start"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Time</FormLabel>
              <FormControl>
                <Input {...field} type="time" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="end"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Time</FormLabel>
              <FormControl>
                <Input {...field} type="time" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="externalId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>External ID</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="group"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {timetable.combinedPartnerSpaceCode && (
          <FormField
            control={form.control}
            name="isCombinedSession"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Session is combined with{" "}
                    {timetable.combinedPartnerSpaceCode}
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        )}
        <Button variant={"constructive"} type="submit">
          {selectedEvent ? "Update" : "Create"}
        </Button>

        {selectedEvent ? (
          <Button
            variant={"destructive"}
            className="ml-2"
            onClick={(event) => {
              event.preventDefault();
              alert("deleting " + selectedEvent.name);
            }}
          >
            Delete
          </Button>
        ) : (
          <></>
        )}
      </form>
    </Form>
  );
};

 const newEventWindow = () => (
   <Sheet open={eventSheetIsOpen} onOpenChange={setEventSheetIsOpen}>
     <SheetTrigger asChild>
       <Button variant={"constructive"} onClick={() => setSelectedEvent(null)}>
         New Event
       </Button>
     </SheetTrigger>
     <SheetContent className="w-full max-w-[540px]">
       <SheetHeader>
         <SheetTitle>{selectedEvent ? "Edit Event" : "New Event"}</SheetTitle>
         <SheetDescription>
           {selectedEvent
             ? `Edit the event for the timetable ${timetable.spaceCode}.`
             : `Create a new event for the timetable ${timetable.spaceCode}.`}
         </SheetDescription>
       </SheetHeader>
       <ScrollArea className="h-[calc(100vh-150px)]">
         {newEventForm(selectedEvent)}
       </ScrollArea>
     </SheetContent>
   </Sheet>
 );


  return (
    <div className="w-full text-xl flex flex-col items-center text-center p-10 pt-0">
      <div className="flex flex-col laptop:flex-row w-full justify-between items-center">
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
        <div className="flex flex-row justify-evenly gap-2 mt-5 laptop:mt-0 bg-black p-5 rounded-xl">
          <Button
            variant="primaryOutline"
            onClick={() => {
              const newWindow = window.open(
                `${Y2_URL}/#/room/${timetable.id}`,
                "_blank"
              );
              if (newWindow) {
                newWindow.focus();
              }
            }}
          >
            Open in Y2
          </Button>
          <Button variant={"primaryOutline"}>Edit</Button>
          {newEventWindow()}
        </div>
      </div>
      <h2 className="my-5 text-3xl w-full text-left">Events</h2>
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-[200px] grid-cols-2">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <div className="relative overflow-x-auto tablet:shadow-md mt-5 rounded-xl w-full items-center">
            <TimetableEventsTableList
              headers={["name", "moduleCode", "staff", "start", "end"]}
              data={events}
              onEdit={(event) => {
                console.log(event);
                setSelectedEvent(event);
                setEventSheetIsOpen(true);
              }}
            />
          </div>
        </TabsContent>
        <TabsContent value="calendar">
          <div className="w-full">
            <h1>Not yet implemented!!!</h1>
            <p>
              Calendar view is gonna be a little bit more tricky so it's not
              been done yet. But fear not it will be done soon :P
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
