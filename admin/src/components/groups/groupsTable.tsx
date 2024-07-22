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
  SheetClose,
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
import type { ITimetableGroup } from "@/interfaces/timetableGroup";

const GroupFormSchema = z.object({
  internalName: z.string().min(1).max(128),
  name: z.string().min(1).max(128),
  subtitle: z.string().min(1).max(128),
  object: z.string().min(1).max(30),
  verbAvailable: z.string().max(30),
  verbUnavailable: z.string().max(30),
});

interface CreateNewGroupProps {
  fetchData: () => void;
}

const CreateNewGroup: React.FC<CreateNewGroupProps> = ({ fetchData }) => {
  const [newGroupSheetIsOpen, setNewGroupSheetIsOpen] = React.useState(false);

  const form = useForm<z.infer<typeof GroupFormSchema>>({
    resolver: zodResolver(GroupFormSchema),
    defaultValues: {
      internalName: "",
      name: "",
      subtitle: "",
      object: "room",
      verbAvailable: "free",
      verbUnavailable: "in use",
    },
  });

  const checkIfUserIsTech = async () => {
    try {
      const response = await axios.get(API_URL + "/v2/user/me", {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });
      return response.data.users[0].role === "TECHNICIAN";
    } catch (error) {
      console.error("There was an error!", error);
      toast("Error checking if you have permission " + error?.message);
      return false;
    }
  };

  const onSubmit = async (data: any) => {
    if (!checkIfUserIsTech()) {
      toast("You're not a technician! You cannot modify other users.");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to create the timetable group ${data.internalName} to Asgard?`
      )
    ) {
      toast("Action has been cancelled");
      return;
    }

    try {
      await axios.post(API_URL + "/v2/timetable-group", data, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });
      toast("Timetable group created successfully");
      setNewGroupSheetIsOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("There was an error!", error);
      toast(error.response.data.message || "Something went wrong");
    }
  };

  return (
    <Sheet open={newGroupSheetIsOpen} onOpenChange={setNewGroupSheetIsOpen}>
      <SheetTrigger asChild>
        <Button variant={"primary"}>Add</Button>
      </SheetTrigger>
      <SheetContent className="w-full max-w-[540px]">
        <SheetHeader>
          <SheetTitle>Create New Timetable Group</SheetTitle>
          <SheetDescription>
            Create a display which shows multiple timetables.
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
                name="internalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Internal Name<span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the name used by technicians to describe the
                      screen, it is not shown visually on the screen. You should
                      use a description which describes the location it would be
                      used.
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
                    <FormLabel>
                      Area Name<span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      This is top most name of the timetable, it should be the
                      organisational unit of the area it is being shown. e.g.
                      School of Computer Science.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Group Title<span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the large name of the view and is shown on the
                      timetable, it should be something like "Today's timetable"
                      and must be short and sweet.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="object"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Object<span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      What are these timetables? Are they booths? Are they
                      rooms? Are they labs? The word you use here must be able
                      to be pluralised by adding a <kbd>s</kbd> at the end.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="verbAvailable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Available Verb<span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Verb to describe that one of the timetables are available.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="verbUnavailable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Unavailable Verb
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Verb to describe that one of the timetables are
                      unavailable.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

export function GroupsTable() {
  const [groups, setGroups] = React.useState([{} as ITimetableGroup]);
  const fetchData = async () => {
    await axios
      .get(API_URL + "/v2/timetable-group", {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      })
      .then((response) => {
        const data = response.data.groups;
        setGroups(data);
        if (data.length == 0) {
          toast("No groups available");
        }
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
        <h1 className="text-3xl font-extrabold text-center">Timetable Groups</h1>
        <CreateNewGroup fetchData={fetchData} />
      </div>
      <div className="relative overflow-x-auto tablet:shadow-md rounded-xl m-2 tablet:m-10">
        <TableList
          headers={["internalName", "name", "subtitle"]}
          data={groups}
          urlBase="/groups"
        />
      </div>
    </>
  );
}
