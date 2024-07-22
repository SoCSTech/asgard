import * as React from "react";
import axios from "axios";
import { API_URL, Y2_URL } from "@/constants";
import { getCookie } from "@/lib/cookie";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { object, z } from "zod";
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
import { Icon } from "@iconify/react";
import type {
  ITimetableGroup,
  TimetableListData,
} from "@/interfaces/timetableGroup";
import { GripHorizontal, Save, Trash } from "lucide-react";

interface Direction {
  icon: string;
  label: string;
}

type TimetableDirectionsType = {
  [key: string]: Direction;
};

const TimetableDirections: TimetableDirectionsType = {
  UPSTAIRS: {
    icon: "fa-solid:level-up-alt",
    label: "Upstairs",
  },
  DOWNSTAIRS: {
    icon: "fa-solid:level-down-alt",
    label: "Downstairs",
  },
  LEFT: {
    icon: "fa-solid:arrow-left",
    label: "Left",
  },
  RIGHT: {
    icon: "fa-solid:arrow-right",
    label: "Right",
  },
  FORWARD: {
    icon: "fa-solid:arrow-up",
    label: "Forward",
  },
  BACKWARD: {
    icon: "fa-solid:arrow-down",
    label: "Backward",
  },
};

function getDirectionIcon(direction: string): string {
  if (direction === null || direction === undefined) {
    return "";
  }
  return TimetableDirections[direction].icon;
}

const GroupMemberFormSchema = z.object({
  location: z.string(),
  order: z.number(),
});

function timetableCard(
  item: TimetableListData,
  groupId: string
): React.ReactElement {
  const onSubmit = async (data: any) => {
    console.log(data);
  };

  const removeTimetable = async () => {
    if (
      !confirm(
        `Are you sure you want to remove ${item.timetable.spaceCode} from the group?`
      )
    ) {
      toast("Action has been cancelled");
      return;
    }

    await axios
      .delete(API_URL + "/v2/timetable-group/remove", {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
        data: {
          timetableId: item.timetable.id,
          groupId: groupId,
        },
      })
      .then(() => {
        toast("Timetable has been removed from group!");
      })
      .catch((error) => {
        console.error("There was an error!", error);
        toast(error.message);
      });
  };

  return (
    <div
      key={item.timetable.spaceCode}
      className="flex flex-col bg-black dark:bg-muted text-white rounded-2xl p-10 mt-10 w-full items-center text-left justify-between"
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <GripHorizontal className="mr-5" />
          <h1 className="font-semibold">{item.timetable.spaceCode}</h1>
        </div>

        <div className="flex items-center">
          {item.location && (
            <Icon icon={getDirectionIcon(item.location)} className="mr-5" />
          )}
          <Button
            variant={"ghost"}
            onClick={(event) => {
              event.preventDefault();
              removeTimetable();
            }}
          >
            <Trash className="text-red-500" />
          </Button>
          <Button
            variant={"ghost"}
            type="submit"
            onClick={() => alert("nyi! update " + item.timetable.spaceCode)}
          >
            <Save className="text-green-500" />
          </Button>
        </div>
      </div>
      <div className="w-full p-2">This is the bottom mlem</div>
    </div>
  );
}

function timetablesList(
  data: ITimetableGroup | undefined | null
): React.ReactElement[] {
  // Ensure data is an array
  if (!Array.isArray(data?.timetables)) {
    console.error("Invalid data passed to timetablesList:", data);
    return [];
  }
  console.log(data.timetables);
  return data.timetables.map((item: TimetableListData) => {
    return timetableCard(item, data.id);
  });
}

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

    console.log(data);
    return;
    try {
      await axios.post(API_URL + "/v2/timetable-group", data, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });
      toast("Timetable group created successfully");
      //  setNewGroupSheetIsOpen(false);
      //  fetchData();
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
    } catch (error) {
      console.error("There was an error!", error);
      toast(error.message);
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
            <div className="flex flex-col tablet:flex-row justify-between bg-black dark:bg-muted text-white rounded-2xl p-10 w-full items-center text-left">
              <img
                src="/images/logos/uol-white-text.svg"
                alt="University of Lincoln"
                className="w-20 h-20 mr-10 self-start hidden tablet:block"
              />
              <div>
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

                <Button
                  variant={"primaryOutline"}
                  className="text-black w-full mt-5 dark:text-white"
                  type="submit"
                >
                  Update
                </Button>
              </div>

              <div className="flex flex-row justify-evenly gap-2 mt-5 laptop:mt-0 p-5 self-start">
                <Button
                  variant="primaryOutline"
                  className="text-black dark:text-white"
                  onClick={(event) => {
                    event.preventDefault()
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
            </div>
          </form>
        </Form>
      </div>
      <div className="w-full text-xl flex flex-col items-center p-2 tablet:p-10 pt-0 pb-0">
        {timetablesList(group)}
        {group.id}
      </div>
    </>
  );
}
