import * as React from "react";
import axios from "axios";
import { API_URL, Y2_URL } from "@/constants";
import { getCookie } from "@/lib/cookie";
import { CalendarIcon, Copy } from "lucide-react";
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
import { Check, ChevronsUpDown } from "lucide-react";

const eventTypes = [
  { label:"Other", value:"OTHER" },
  { label:"Workshop", value:"WORKSHOP" },
  { label:"Lecture", value:"LECTURE" },
  { label:"Social", value:"SOCIAL" },
  { label:"Maintenance", value:"MAINTENANCE" },
  { label:"Exam", value:"EXAM" },
  { label:"Project", value:"PROJECT" }
]

interface Props {
  timetableId: string;
}

const FormSchema = z.object({
  // username: z.string().min(2, {
  //   message: "Username must be at least 2 characters.",
  // }),

  name: z.string(),
  staff: z.string().optional(),
  type: z.string().default("OTHER"),
  colour: z.string(),
  start: z.string().datetime(),
  end: z.string().datetime(),
  isCombinedSession: z.boolean().default(false),
  group: z.string().default(""),
  externalId: z.string().default(""),
});

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

        if (response.data.timetables.length == 0) {
          toast("No timetables are found");
        }
      })
      .catch((error) => {
        console.error("There was an error!", error);
        toast(error.message);
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
        if (response.data.events.length == 0) {
          toast("No events are found");
        }
      })
      .catch((error) => {
        console.error("There was an error!", error);
        toast(error.message);
      });
  };

  React.useEffect(() => {
    fetchTimetableData();
    fetchEventsData();
  }, []);

  const newEventForm = () => {
    const form = useForm<z.infer<typeof FormSchema>>({
      resolver: zodResolver(FormSchema),
      defaultValues: {
        // username: "",
      },
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
      toast("new event!");
    }

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
                  This is the event display name.
                </FormDescription>
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
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Input placeholder="shadcn" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
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
                  The types allows Yggdrasil to show different icons and act in different ways.
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
                  <Input defaultValue={"#fcc05f"} {...field} />
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
            name="start"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"primaryOutline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Your date of birth is used to calculate your age.
                </FormDescription>
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

          {/* <FormField
            control={form.control}
            name="externalId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>External Id</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}
          {/* 
          <FormField
            control={form.control}
            name="externalId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>External Id</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>External Id</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>External Id</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>External Id</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>External Id</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>External Id</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          {timetable.combinedPartnerSpaceCode ? (
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
          ) : (
            ""
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
      <Dialog>
        <DialogTrigger asChild>
          <Button variant={"constructive"}>New Event</Button>
        </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New Event</DialogTitle>
              <DialogDescription>
                Create a new event for the timetable {timetable.spaceCode}.
              </DialogDescription>
            </DialogHeader>
            {newEventForm()}
          </DialogContent>
      </Dialog>
    );
  };

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
        <div className="flex flex-row justify-evenly gap-2">
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
          <div className="relative overflow-x-auto tablet:shadow-md mt-5 rounded-xl w-full">
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
