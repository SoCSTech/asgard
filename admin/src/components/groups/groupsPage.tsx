import * as React from "react";
import axios from "axios";
import { API_URL, Y2_URL } from "@/constants";
import { getCookie } from "@/lib/cookie";
import { Button } from "../ui/button";
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
import type { ITimetableGroup } from "@/interfaces/timetableGroup";
import { timetablesList } from "./groupTimetableCard";
import type { ITimetable } from "@/interfaces/timetable";
import { Textarea } from "../ui/textarea";
import { getErrorMessage, type IServerError } from "@/interfaces/serverError";

interface Props {
  groupId: string;
}

const GroupFormSchema = z.object({
  internalName: z.string().min(1).max(128),
  name: z.string().min(1).max(128),
  subtitle: z.string().min(1).max(128),
  displayInfoPane: z.boolean(),
  displayInfoPaneQR: z.boolean(),
  infoPaneText: z.string().max(65535),
  infoPaneQRUrl: z.string().max(256),
  object: z.string().min(1).max(30),
  verbAvailable: z.string().max(30),
  verbUnavailable: z.string().max(30),
});

export function GroupsPage(props: Props) {
  const [group, setGroup] = React.useState<ITimetableGroup>(
    {} as ITimetableGroup
  );
  const [timetables, setTimetables] = React.useState<ITimetable[]>([
    {},
  ] as ITimetable[]);
  const [timetableToAdd, setTimetableToAdd] = React.useState<string>();

  const form = useForm<z.infer<typeof GroupFormSchema>>({
    resolver: zodResolver(GroupFormSchema),
    defaultValues: {
      internalName: "",
      name: "",
      subtitle: "",
      displayInfoPane: false,
      displayInfoPaneQR: false,
      infoPaneText: "",
      infoPaneQRUrl: "",
      object: "room",
      verbAvailable: "free",
      verbUnavailable: "in use",
    },
  });

  const onSubmit = async (data: any) => {
    if (!checkIfUserIsTech()) {
      toast("You're not a technician! You cannot modify other users.");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to update the timetable group ${data.internalName} in Asgard?`
      )
    ) {
      toast("Action has been cancelled");
      return;
    }

    try {
      await axios.put(API_URL + "/v2/timetable-group/" + group.id, data, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });
      toast("Timetable group updated successfully");
      fetchGroupData();
    } catch (error: any) {
      console.error("There was an error!", error);
      toast(error.response.data.message || "Something went wrong");
    }
  };

  const fetchGroupData = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/v2/timetable-group/${props.groupId}`,
        {
          headers: { Authorization: `Bearer ${getCookie("token")}` },
        }
      );
      setGroup(response.data);
    } catch (error: any) {
      const serverError = error as IServerError;
      console.error("There was an error!", serverError);
      toast(getErrorMessage(serverError));
    }
  };

  const fetchTimetablesData = async () => {
    try {
      const response = await axios.get(`${API_URL}/v2/timetable`, {
        headers: { Authorization: `Bearer ${getCookie("token")}` },
      });
      setTimetables(response.data.timetables);
    } catch (error: any) {
      const serverError = error as IServerError;
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
    fetchGroupData();
    fetchTimetablesData();
    checkIfUserIsTech();
  }, []);

  const deactivateTimetableGroup = async () => {
    if (!currentUserIsTechnician) {
      toast(
        "You're not a technician! A technician is the only person who can delete timetables."
      );
      return;
    }

    if (
      !confirm(`Are you sure you want to deactivate ${group.internalName}?`)
    ) {
      toast("Action has been cancelled");
      return;
    }

    await axios
      .delete(API_URL + "/v2/timetable-group/" + group.id, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      })
      .then(() => {
        toast("Timetable group has been deactivated");
        fetchGroupData();
      })
      .catch((error) => {
        console.error("There was an error!", error);
        toast(error.message);
      });
  };

  const reactivateTimetableGroup = async () => {
    if (!currentUserIsTechnician) {
      toast("You're not a technician! You cannot re-enable timetable groups.");
      return;
    }

    if (
      !confirm(`Are you sure you want to reactivate ${group.internalName}?`)
    ) {
      toast("Action has been cancelled");
      return;
    }

    await axios
      .put(
        `${API_URL}/v2/timetable-group/${group.id}`,
        { isDeleted: false },
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
          },
        }
      )
      .then(() => {
        toast("Timetable group has been reactivated");
        fetchGroupData();
      })
      .catch((error) => {
        console.error("There was an error!", error);
        toast(error?.message || "Could not reactivate the timetable group");
      });
  };

  React.useEffect(() => {
    form.reset({
      internalName: group.internalName || "",
      name: group.name || "",
      subtitle: group.subtitle || "",
      displayInfoPane: group.displayInfoPane || false,
      displayInfoPaneQR: group.displayInfoPaneQR || false,
      infoPaneText: group.infoPaneText || "",
      infoPaneQRUrl: group.infoPaneQRUrl || "",
      object: group.object || "",
      verbAvailable: group.verbAvailable || "",
      verbUnavailable: group.verbUnavailable || "",
    });
  }, [group]);

  const addTimetableToGroup = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    try {
      await axios.post(
        API_URL + "/v2/timetable-group/add",
        {
          timetableId: timetableToAdd,
          groupId: group.id,
        },
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
          },
        }
      );

      toast("Added timetable to group");
      fetchGroupData();
    } catch (error: any) {
      const serverError = error as IServerError;
      toast(getErrorMessage(serverError));
      return;
    }
  };

  const displayingInfoPane = form.watch("displayInfoPane", false);
  const displayingInfoPaneQR = form.watch("displayInfoPaneQR", false);

  return (
    <>
      {group.isDeleted && (
        <div className="w-full text-xl flex flex-col p-2 tablet:p-10 pt-0">
          <div className="bg-destructive px-10 text-center py-5 rounded-xl text-white">
            <p>
              This timetable group is deleted, it will need to be reactivated
              before you can use it.
            </p>
          </div>
        </div>
      )}
      <div className="w-full text-xl flex flex-row tablet:flex-col items-center p-2 tablet:p-10 pt-0 mt-0 pb-0 mb-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
            <div className="flex flex-col tablet:flex-row justify-around bg-black dark:bg-muted text-white rounded-2xl p-10 w-full items-center text-left">
              <div className="flex flex-col pr-10 justify-evenly self-start">
                <img
                  src="/images/logos/uol-white-text.svg"
                  alt="University of Lincoln"
                  className="w-20 h-20 mr-10 self-start hidden tablet:block mb-5"
                />
                <Button
                  variant="primaryOutline"
                  className="text-black dark:text-white mb-3"
                  onClick={(event) => {
                    event.preventDefault();
                    const newWindow = window.open(
                      `${Y2_URL}/#/group/${group.id}`,
                      "_blank"
                    );
                    if (newWindow) {
                      newWindow.focus();
                    }
                  }}
                >
                  Open in Y2
                </Button>

                {group.isDeleted ? (
                  <Button
                    variant={"constructive"}
                    onClick={(event) => {
                      event.preventDefault();
                      reactivateTimetableGroup();
                    }}
                  >
                    Reactivate
                  </Button>
                ) : (
                  <Button
                    variant={"destructive"}
                    onClick={(event) => {
                      event.preventDefault();
                      deactivateTimetableGroup();
                    }}
                  >
                    Deactivate
                  </Button>
                )}
              </div>
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="internalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internal Name</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-black border-dashed text-xl font-bold mb-2 h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area Name</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-black border-dashed text-xl font-bold mb-2 h-10"
                          placeholder={"School of Computer Science"}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem className="mt-5">
                      <FormLabel>Group Title</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-black border-dashed text-2xl tablet:text-4xl font-semibold h-20"
                          placeholder={"Today's Timetable"}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="object"
                  render={({ field }) => (
                    <FormItem className="mt-5">
                      <FormLabel>Timetable Object</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-black border-dashed"
                          placeholder={"room"}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="verbAvailable"
                  render={({ field }) => (
                    <FormItem className="mt-5">
                      <FormLabel>Available Verb</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-black border-dashed"
                          placeholder={"free"}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <p className="italic text-sm pt-2 ml-5 text-azure">
                  "5 {form.watch("object", "room")}s{" "}
                  {form.watch("verbAvailable", "free")}"
                </p>

                <FormField
                  control={form.control}
                  name="verbUnavailable"
                  render={({ field }) => (
                    <FormItem className="mt-5">
                      <FormLabel>Unavailable Verb</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-black border-dashed"
                          placeholder={"in use"}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <p className="italic text-sm pt-2 ml-5 text-azure">
                  "1 {form.watch("object", "room")}{" "}
                  {form.watch("verbUnavailable", "in use")}"
                </p>

                <FormField
                  control={form.control}
                  name="displayInfoPane"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start align-middle space-x-3 space-y-0 rounded-xl border border-dashed p-4 my-5">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border border-white"
                        />
                      </FormControl>
                      <div className="leading-none self-center">
                        <FormLabel>Show Info Pane</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {displayingInfoPane && (
                  <>
                    <FormField
                      control={form.control}
                      name="infoPaneText"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Add a message to the info pane"
                              className="bg-black border-dashed"
                              rows={10}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            You can use markdown here!
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="displayInfoPaneQR"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start align-middle space-x-3 space-y-0 rounded-xl border border-dashed p-4 my-5">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="border border-white"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none self-center">
                            <FormLabel>Show QR Code</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    {displayingInfoPaneQR && (
                      <FormField
                        control={form.control}
                        name="infoPaneQRUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>QR Url</FormLabel>
                            <FormControl>
                              <Input
                                className="bg-black border-dashed text-xl font-bold mb-2 h-10"
                                placeholder="https://lncn.ac"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </>
                )}

                <Button
                  variant={"primaryOutline"}
                  className="text-black w-full mt-5 dark:text-white"
                  type="submit"
                >
                  Update
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
      <div className="w-full text-2xl text-semibold flex flex-row tablet:flex-col items-center pb-0 mb-2">
        <h2>Timetables</h2>
      </div>
      <div className="w-full text-xl flex flex-row items-center p-2 tablet:px-10 pt-0 mt-0 pb-0 mb-0">
        <Select value={timetableToAdd} onValueChange={setTimetableToAdd}>
          <SelectTrigger>
            <SelectValue placeholder="Add new timetable to group" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {timetables.map((tt: ITimetable) => (
                <SelectItem key={"add_" + tt.id} value={tt.id}>
                  {tt.spaceCode}: {tt.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          onClick={async (event) => await addTimetableToGroup(event)}
          variant={"constructive"}
          className="ml-5"
        >
          Add Timetable
        </Button>
      </div>
      <div className="w-full text-xl flex flex-col items-center p-2 tablet:p-10 pt-0 pb-0">
        {timetablesList(group, fetchGroupData)}
      </div>
    </>
  );
}
