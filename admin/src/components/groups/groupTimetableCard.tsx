import * as React from "react";
import axios from "axios";
import { API_URL } from "@/constants";
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
  return TimetableDirections[direction]?.icon || "";
}

// Move this hook out of the loop to fix the Rules of Hooks violation
const GroupMemberFormSchema = z.object({
  location: z.string(),
  order: z.string(),
});

export function TimetableCard({
  item,
  groupId,
  refreshData,
}: {
  item: TimetableListData;
  groupId: string;
  refreshData: () => void;
}): React.ReactElement {
  const itemForm = useForm<z.infer<typeof GroupMemberFormSchema>>({
    resolver: zodResolver(GroupMemberFormSchema),
    defaultValues: {
      location: item.location || "",
      order: (item.order || "0") as string,
    },
  });

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
        refreshData();
      })
      .catch((error) => {
        console.error("There was an error!", error);
        toast(error.message);
      });
  };

  async function onItemSubmit(values: z.infer<typeof GroupMemberFormSchema>) {
    await axios
      .put(
        `${API_URL}/v2/timetable-group/member`,
        {
          timetableId: item.timetable.id,
          groupId: groupId,
          location: values.location,
          order: values.order,
        },
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
          },
        }
      )
      .then(() => {
        toast("Timetable group has been updated");
        refreshData();
      })
      .catch((error) => {
        console.error("There was an error!", error);
        toast(error?.message || "Could not reactivate the timetable group");
      });
  }

  return (
    <div
      key={item.timetable.spaceCode}
      className="flex flex-col bg-black dark:bg-muted text-white rounded-2xl p-10 mt-10 w-full items-center text-left justify-between"
    >
      <Form {...itemForm}>
        <form onSubmit={itemForm.handleSubmit(onItemSubmit)} className="w-full">
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
              <Button variant={"ghost"} type="submit">
                <Save className="text-green-500" />
              </Button>
            </div>
          </div>
          <div className="w-full p-2 flex mr-5">
            <FormField
              control={itemForm.control}
              name="order"
              render={({ field }) => (
                <FormItem className="mr-5">
                  <FormLabel>Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className="bg-black border-dashed text-xl font-bold mb-2 h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={itemForm.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
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
          </div>
        </form>
      </Form>
    </div>
  );
}

export function timetablesList(
  data: ITimetableGroup | undefined | null,
  refreshData: () => void
): React.ReactElement[] {
  if (!data || !Array.isArray(data.timetables)) {
    console.error("Invalid data passed to timetablesList:", data);
    return [];
  }
  return data.timetables.map((item: TimetableListData) => {
    return (
      <TimetableCard
        key={item.timetable.id}
        item={item}
        groupId={data.id}
        refreshData={refreshData}
      />
    );
  });
}
