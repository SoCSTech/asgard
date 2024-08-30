import * as React from "react";
import axios from "axios";
import { API_URL } from "@/constants";
import { getCookie } from "@/lib/cookie";
import TableList from "../theme/tableList";
import type { ITimetable } from "@/interfaces/timetable";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import ColourSelector from "../theme/colourPicker";
import { Checkbox } from "../ui/checkbox";
import { getErrorMessage, type IServerError } from "@/interfaces/serverError";
import { server } from "typescript";

const TimetableFormSchema = z.object({
  spaceCode: z.string().min(1).max(10),
  lab: z.string().min(1).max(4),
  name: z.string().min(1).max(256),
  capacity: z.string().min(1),
  canCombine: z.boolean(),
  combinedPartnerId: z.string(),
  dataSource: z.string().min(1).max(128),
  dataUrl: z.string().max(256),
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

interface CreateNewTimetableProps {
  fetchData: () => void;
  timetables: ITimetable[];
}

const CreateNewTimetable: React.FC<CreateNewTimetableProps> = ({
  fetchData,
  timetables,
}) => {
  const [newTimetableSheetIsOpen, setNewTimetableSheetIsOpen] =
    React.useState(false);

  const form = useForm<z.infer<typeof TimetableFormSchema>>({
    resolver: zodResolver(TimetableFormSchema),
    defaultValues: {
      spaceCode: "",
      lab: "",
      name: "",
      capacity: "0",
      canCombine: false,
      combinedPartnerId: "",
      dataSource: "",
      dataUrl: "",
      defaultColour: "",
    },
  });

  const canCombine = form.watch("canCombine", false);

  /* 
    If the data source is ICAL or MS Bookings,
    then... this needs a data url and should be shown.
  */
  let requiresCustomDataUrl = false;
  const dataSource = form.watch("dataSource");
  if (dataSource == "ICAL" || dataSource == "MS_BOOKINGS") {
    requiresCustomDataUrl = true;
  } else {
    requiresCustomDataUrl = false;
  }

  const checkIfUserIsTech = async () => {
    try {
      const response = await axios.get(API_URL + "/v2/user/me", {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });
      return response.data.users[0].role === "TECHNICIAN";
    } catch (error: any) {
      const serverError = error as IServerError;
      console.error("There was an error!", server);
      toast(
        getErrorMessage(serverError, "Error checking if you have permission")
      );
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
      await axios.post(API_URL + "/v2/timetable", submissionData, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });
      toast("Timetable created successfully");
      setNewTimetableSheetIsOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("There was an error!", error);
      toast(error.response.data.message || "Something went wrong");
    }
  };

  return (
    <Sheet
      open={newTimetableSheetIsOpen}
      onOpenChange={setNewTimetableSheetIsOpen}
    >
      <SheetTrigger asChild>
        <Button variant={"primary"}>Add</Button>
      </SheetTrigger>
      <SheetContent className="w-full max-w-[540px]">
        <SheetHeader>
          <SheetTitle>Create New Timetable</SheetTitle>
          <SheetDescription>
            Create a new timetable so you can show events on the carousels and
            group displays.
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

              {requiresCustomDataUrl && (
                <FormField
                  control={form.control}
                  name="dataUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Url</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the URL that streams the ICS data.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
                Create
              </Button>
            </form>
          </Form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export function TimetablesTable() {
  const [timetables, setTimetables] = React.useState([{} as ITimetable]);
  const fetchData = async () => {
    await axios
      .get(API_URL + "/v2/timetable", {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      })
      .then((response) => {
        const data = response.data.timetables;
        let newData: ITimetable[] = [];

        if (data.length == 0) {
          toast("No timetables are found");
        }

        data.map((tt: ITimetable) => {
          let newTimetable = tt;
          newTimetable.dataSource = formatEnumValue(tt.dataSource);
          newData.push(newTimetable);
        });
        setTimetables(newData);
      })
      .catch((error) => {
        console.error("There was an error!", error);
        toast(error.message);
      });
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <div className="flex flex-row justify-between px-2 tablet:px-10 py-0">
        <div></div>
        <h1 className="text-3xl font-extrabold text-center">Timetables</h1>
        <CreateNewTimetable fetchData={fetchData} timetables={timetables} />
      </div>
      <div className="relative overflow-x-auto tablet:shadow-md rounded-xl m-2 tablet:m-10">
        <TableList
          headers={["spaceCode", "name", "capacity", "dataSource"]}
          data={timetables}
          urlBase="/timetables"
        />
      </div>
    </>
  );
}
