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
  SheetTrigger
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
import FavouriteButton from "../theme/favouriteButton";
import { getErrorMessage, type IServerError } from "@/interfaces/serverError";

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

const TimetableFormSchema = z.object({
  spaceCode: z.string().min(1).max(10),
  lab: z.string().max(4),
  name: z.string().min(1).max(256),
  capacity: z.string().min(1),
  canCombine: z.boolean(),
  combinedPartnerId: z.string(),
  dataSource: z.string().min(1).max(128),
  defaultColour: z.string().length(7, {
    message:
      "Select a colour from the list or select custom and enter a specific colour",
  }),
});

export const TimetableDataSources = [
  { label: "Manual", value: "MANUAL" },
  { label: "UoL Timetable", value: "UOL_TIMETABLE" },
  { label: "Internet Calendar Stream", value: "ICAL" },
  { label: "Microsoft Bookings", value: "MS_BOOKINGS" },
];

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

interface EditTimetableProps {
  fetchData: () => void;
  timetable: ITimetable;
}

const EditTimetable: React.FC<EditTimetableProps> = ({
  fetchData,
  timetable,
}) => {
  const [editTimetableSheetIsOpen, setEditTimetableSheetIsOpen] =
    React.useState(false);

  const form = useForm<z.infer<typeof TimetableFormSchema>>({
    resolver: zodResolver(TimetableFormSchema),
    defaultValues: {
      spaceCode: "",
      lab: "",
      name: "",
      capacity: (0).toString(),
      canCombine: false,
      combinedPartnerId: "",
      dataSource: "",
      defaultColour: "",
    },
  });

  const canCombine = form.watch("canCombine", false);

  const [timetables, setTimetables] = React.useState<ITimetable[]>([]);

  React.useEffect(() => {
    fetchTimetables();
  }, []);

  const fetchTimetables = async () => {
    try {
      const response = await axios.get(`${API_URL}/v2/timetable`, {
        headers: { Authorization: `Bearer ${getCookie("token")}` },
      });
      const timetables = response.data.timetables;
      if (timetables.length === 0) {
        toast("No timetables found");
      } else {
        setTimetables(timetables);
      }
    } catch (error: any) {
      const serverError = error as IServerError
      console.error("There was an error!", serverError);
      toast(getErrorMessage(serverError));
    }
  };

  React.useEffect(() => {
    form.reset({
      spaceCode: timetable.spaceCode || "",
      lab: timetable.lab || "",
      name: timetable.name || "",
      capacity: (timetable.capacity || 0).toString(),
      canCombine: timetable.canCombine || false,
      combinedPartnerId: timetable.combinedPartnerId || "",
      dataSource: timetable.dataSource || "",
      defaultColour: timetable.defaultColour || "",
    });
  }, [timetable]);

  const checkIfUserIsTech = async () => {
    try {
      const response = await axios.get(API_URL + "/v2/user/me", {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });
      return response.data.users[0].role === "TECHNICIAN";
    } catch (error: any) {
      const serverError = error as IServerError
      console.error("There was an error!", error);
      toast(getErrorMessage(serverError, "Error checking if you have permission"));
      return false;
    }
  };

  const onSubmit = async (data: any) => {
    // Blank out partner ID if cant combine
    let submissionData = data;
    if (!canCombine) {
      submissionData.combinedPartnerId = null;
    }

    if (!checkIfUserIsTech()) {
      toast("You're not a technician! You cannot modify other users.");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to create the timetable ${submissionData.spaceCode} (${submissionData.name}) to Asgard?`
      )
    ) {
      toast("Action has been cancelled");
      return;
    }

    try {
      await axios.put(
        API_URL + "/v2/timetable/" + timetable.id,
        submissionData,
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
          },
        }
      );
      toast("Timetable updated successfully");
      setEditTimetableSheetIsOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("There was an error!", error);
      toast(error.response.data.message || "Something went wrong");
    }
  };

  return (
    <Sheet
      open={editTimetableSheetIsOpen}
      onOpenChange={setEditTimetableSheetIsOpen}
    >
      <SheetTrigger asChild>
        <Button variant={"primaryOutline"}>Edit</Button>
      </SheetTrigger>
      <SheetContent className="w-full max-w-[540px]">
        <SheetHeader>
          <SheetTitle>Edit Timetable</SheetTitle>
          <SheetDescription>
            Editing the details for {timetable.spaceCode}'s timetable.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-150px)]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 px-1"
            >
              <FormField
                control={form.control}
                name="spaceCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Space Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the rooms official name which has been given to us
                      by estates, such as <strong>INB1201</strong>, but also may
                      be slightly different for specific bookable booths.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lab"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lab Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the internal "SoCS" name for the lab, such as
                      INB1102 is known as 1A.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the long name for a room, e.g. "Computing Lab 1A".
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      How many people can you fit in this timetable?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="defaultColour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Default Event Colour
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <ColourSelector
                        selectedColour={field.value}
                        onChange={field.onChange}
                        defaultColour={""}
                      />
                    </FormControl>
                    <FormDescription>
                      What colour would you like the events to be if you don't
                      explicitly set a colour?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dataSource"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data Source</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select how this timetable gets it's data" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {TimetableDataSources.map((source) => (
                            <SelectItem key={source.value} value={source.value}>
                              {source.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How are you entering data into this timetable? Are you
                      doing it manually for each event? Are you using the
                      University's room bookings? Or are you subscribing to a
                      calendar?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="canCombine"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        This timetable can combine with another timetable that
                        already exists.
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {canCombine && (
                <FormField
                  control={form.control}
                  name="combinedPartnerId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Partner Timetable</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select which timetable we are paired with" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {timetables.map((tt: ITimetable) => (
                              <SelectItem key={tt.id} value={tt.id}>
                                {tt.spaceCode}: {tt.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button variant={"constructive"} type="submit">
                Update
              </Button>
            </form>
          </Form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export function TimetablePage(props: Props) {
  const [timetable, setTimetable] = React.useState<ITimetable>(
    {} as ITimetable
  );
  const [events, setEvents] = React.useState<IEvent[]>([]);
  const [eventSheetIsOpen, setEventSheetIsOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<IEvent | null>(null);

  const handleFavouriteChange = async (newFavouriteStatus: boolean) => {
    if (timetable) {
      if (newFavouriteStatus) {
        // I want to favourite it!
        try {
          await axios.post(
            `${API_URL}/v2/timetable/my`,
            {
              user: "me",
              timetable: timetable.id,
            },
            {
              headers: { Authorization: `Bearer ${getCookie("token")}` },
            }
          );
          toast("Added to Favourites");
        } catch (error: any) {
          const serverError = error as IServerError
          toast(getErrorMessage(serverError, "Couldn't favourite it"));
        }
      } else {
        // I want to unfavourite it!
        try {
          await axios.delete(`${API_URL}/v2/timetable/my`, {
            data: {
              user: "me",
              timetable: timetable.id,
            },
            headers: { Authorization: `Bearer ${getCookie("token")}` },
          });
          toast("Removed from Favourites");
        } catch (error: any) {
          const serverError = error as IServerError
          toast(getErrorMessage(serverError, "Couldn't unfavourite it"));
        }
      }
      // Update the local state after the API call
      setTimetable((prev) =>
        prev ? { ...prev, isFavourite: newFavouriteStatus } : prev
      );
    }
  };

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
   } catch (error: any) {
     // Specify 'any' as the type for the catch clause variable
     const serverError = error as IServerError; // Cast error to IServerError
     console.error("There was an error!", serverError);
     toast(getErrorMessage(serverError));
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
    } catch (error: any) {
      const serverError = error as IServerError
      console.error("There was an error!", serverError);
      toast(getErrorMessage(serverError));
    }
  };

  const [currentUserIsTechnician, setCurrentUserIsTechnician] =
    React.useState(false);

  const checkIfUserIsTech = async () => {
    await axios
      .get(API_URL + "/v2/user/me", {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      })
      .then((response) => {
        if (response.data.users[0].role === "TECHNICIAN") {
          setCurrentUserIsTechnician(true);
        } else {
          setCurrentUserIsTechnician(false);
        }
      })
      .catch((error) => {
        console.error("There was an error!", error);
        toast("Error checking if you have permission " + error.message);
      });
  };

  React.useEffect(() => {
    fetchTimetableData();
    fetchEventsData();
    checkIfUserIsTech();
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
    } catch (error: any) {
      const serverError = error as IServerError
      console.error("There was an error!", error);
      toast(getErrorMessage(serverError, "Couldn't save the event"));
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
        start: event
          ? new Date(event.start).toISOString().substring(11, 16)
          : "",
        end: event ? new Date(event.end).toISOString().substring(11, 16) : "",
        isCombinedSession: event?.isCombinedSession || false,
        group: event?.group || "",
        externalId: event?.externalId || "",
      },
    });

    React.useEffect(() => {
      form.reset({
        id: event?.id || "",
        name: event?.name || "",
        staff: event?.staff || "",
        moduleCode: event?.moduleCode || "",
        type: event?.type || "OTHER",
        colour: event?.colour || "",
        date: event?.start
          ? new Date(event.start).toISOString().substring(0, 10)
          : "",
        start: event?.start
          ? new Date(event.start).toISOString().substring(11, 16)
          : "",
        end: event?.end
          ? new Date(event.end).toISOString().substring(11, 16)
          : "",
        isCombinedSession: event?.isCombinedSession || false,
        group: event?.group || "",
        externalId: event?.externalId || "",
      });
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
                        <SelectItem
                          key={eventType.value}
                          value={eventType.value}
                        >
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
                  Colour
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <ColourSelector
                    selectedColour={field.value}
                    onChange={field.onChange}
                    defaultColour={timetable.defaultColour}
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
              onClick={(e) => deleteEvent(e, event?.id)}
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

  const deleteEvent = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    id: string | undefined
  ) => {
    event.preventDefault();

    if (id === undefined) {
      console.error(
        "Trying to delete event but the ID is undefined, not doing that!"
      );
      return;
    }

    try {
      await axios.delete(`${API_URL}/v2/event/${id}`, {
        headers: { Authorization: `Bearer ${getCookie("token")}` },
      });
      toast("Event deleted!");
    } catch (error) {
      toast("Event couldn't be deleted...");
      console.error(error);
    }
    fetchEventsData();
    setEventSheetIsOpen(false);
    setSelectedEvent(null);
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

  const deactivateTimetable = async () => {
    if (!currentUserIsTechnician) {
      toast(
        "You're not a technician! A technician is the only person who can delete timetables."
      );
      return;
    }

    if (
      !confirm(`Are you sure you want to deactivate ${timetable.spaceCode}?`)
    ) {
      toast("Action has been cancelled");
      return;
    }

    await axios
      .delete(API_URL + "/v2/timetable/" + timetable.id, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      })
      .then(() => {
        toast("Timetable has been deactivated");
        fetchTimetableData();
        // fetchEventsData();
      })
      .catch((error) => {
        console.error("There was an error!", error);
        toast(error.message);
      });
  };

  const reactivateTimetable = async () => {
    if (!currentUserIsTechnician) {
      toast("You're not a technician! You cannot re-enable timetables.");
      return;
    }

    if (
      !confirm(`Are you sure you want to reactivate ${timetable.spaceCode}?`)
    ) {
      toast("Action has been cancelled");
      return;
    }

    await axios
      .post(
        `${API_URL}/v2/timetable/reactivate/${timetable.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
          },
        }
      )
      .then(() => {
        toast("Timetable has been reactivated");
        fetchTimetableData();
        fetchEventsData();
      })
      .catch((error) => {
        console.error("There was an error!", error);
        toast(error?.message || "Could not reactivate the timetable");
      });
  };

  return (
    <>
      {timetable.isDeleted && (
        <div className="w-full text-xl flex flex-col p-2 tablet:p-10 pt-0">
          <div className="bg-destructive px-10 text-center py-5 rounded-xl text-white">
            <p>
              This timetable is deleted, it will need to be reactivated before
              you can use it.
            </p>
          </div>
        </div>
      )}
      <div className="w-full text-xl flex flex-col items-center text-center p-2 tablet:p-10 pt-0">
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
              <li className="flex flex-row items-center">
                <strong>Default Event Colour:</strong>
                <div
                  className="w-5 h-5 rounded-full ml-2"
                  style={{ backgroundColor: timetable.defaultColour }}
                ></div>
                <span className="ml-2"> {timetable.defaultColour}</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col tablet:flex-row justify-evenly gap-2 mt-5 laptop:mt-0 bg-black p-5 rounded-xl">
            {currentUserIsTechnician && (
              <FavouriteButton
                onFavouriteChange={handleFavouriteChange}
                defaultValue={timetable.isFavourite}
              />
            )}
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
            <EditTimetable
              fetchData={fetchTimetableData}
              timetable={timetable}
            />

            {timetable.isDeleted ? (
              <Button
                variant={"constructive"}
                onClick={() => reactivateTimetable()}
              >
                Reactivate
              </Button>
            ) : (
              <Button
                variant={"destructive"}
                onClick={() => deactivateTimetable()}
              >
                Deactivate
              </Button>
            )}
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
    </>
  );
}
