import * as React from "react";
import axios from "axios";
import { API_URL, Y2_URL } from "@/constants";
import { getCookie } from "@/lib/cookie";
import { CalendarIcon, Copy, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "../ui/button";
import type { ITimetable } from "@/interfaces/timetable";
import TableList from "../theme/tableList";
import type { IEvent } from "@/interfaces/event";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "../ui/label";
import { formatEnumValue } from "@/lib/enum";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { boolean, z } from "zod";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Calendar } from "../ui/calendar";

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

const FormSchema = z.object({
  name: z.string().min(2).max(128),
  staff: z.string(),
  moduleCode: z.string(),
  type: z.string(),
  colour: z.string().min(7).max(7),
  start: z.string(),
  end: z.string(),
  isCombinedSession: z.boolean(),
  group: z.string().max(10),
  externalId: z.string().max(128),
});

export function TimetablePage(props: Props) {
  const [timetable, setTimetable] = React.useState({} as ITimetable);
  const [events, setEvents] = React.useState([{} as IEvent]);
  const [sheetIsOpen, setSheetIsOpen] = React.useState(false);

  const fetchTimetableData = async () => {
    try {
      const response = await axios.get(
        API_URL + "/v2/timetable/" + props.timetableId,
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
          },
        }
      );
      if (response.data.timetables.length === 0) {
        toast("No timetables are found");
      } else {
        setTimetable(response.data.timetables[0]);
      }
    } catch (error) {
      console.error("There was an error!", error);
      toast(error.message);
    }
  };

  const fetchEventsData = async () => {
    try {
      const response = await axios.get(
        API_URL + "/v2/timetable/" + props.timetableId + "/events",
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
          },
        }
      );
      if (response.data.events.length === 0) {
        toast("No events are found");
      } else {
        setEvents(response.data.events);
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

  const newEventForm = () => {
    const form = useForm<z.infer<typeof FormSchema>>({
      resolver: zodResolver(FormSchema),
      defaultValues: {
        name: "",
        staff: "",
        moduleCode: "",
        type: "OTHER",
        colour: "",
        start: "",
        end: "",
        isCombinedSession: false,
        group: "",
        externalId: "",
      },
    });

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
      let response
      try {
        response = await axios.post(
          API_URL + "/v2/event",
          {
            name: data.name,
            staff: data.staff,
            moduleCode: data.moduleCode,
            timetableId: props.timetableId,
            type: data.type,
            colour: data.colour,
            start: "2024-07-01 10:00:00",
            end: "2024-07-01 12:00:00",
            isCombinedSession: data.isCombinedSession,
            group: data.group,
          },
          {
            headers: {
              Authorization: `Bearer ${getCookie("token")}`,
            },
          }
        );
        toast("New event created!");
        fetchEventsData();
        setSheetIsOpen(false);
      } catch (error) {
        console.error("There was an error!", error);
        toast(error.response.data.message || "Couldn't add the event");
      }
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <FormLabel>Type</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="primaryOutline"
                        role="combobox"
                        className={cn(
                          "w-[200px] justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? eventTypes.find(
                              (type) => type.value === field.value
                            )?.label
                          : "Select event type"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search types..." />
                      <CommandEmpty>No event type found.</CommandEmpty>
                      <CommandGroup>
                        {eventTypes.map((type) => (
                          <CommandItem
                            value={type.label}
                            key={type.value}
                            onSelect={() => {
                              form.setValue("type", type.value);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                type.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {type.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  The types allows Yggdrasil to show different icons and act in
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
                  <Input {...field} />
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
                <FormLabel>
                  Start<span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>
                  End<span className="text-destructive">*</span>
                </FormLabel>
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
            Create
          </Button>
        </form>
      </Form>
    );
  };

  const newEventWindow = () => {
    return (
      <Sheet open={sheetIsOpen} onOpenChange={setSheetIsOpen}>
        <SheetTrigger asChild>
          <Button variant={"constructive"}>New Event</Button>
        </SheetTrigger>
        <SheetContent className="w-full max-w-[540px]">
          <SheetHeader>
            <SheetTitle>New Event</SheetTitle>
            <SheetDescription>
              Create a new event for the timetable {timetable.spaceCode}.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-150px)]">
            {newEventForm()}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  };

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
            <TableList
              headers={["name", "moduleCode", "staff", "start", "end"]}
              data={events}
              urlBase="/events"
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
