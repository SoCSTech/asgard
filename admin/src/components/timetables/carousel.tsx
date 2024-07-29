import * as React from "react";
import axios from "axios";
import { API_URL } from "@/constants";
import { getCookie } from "@/lib/cookie";
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
import { Button } from "../ui/button";
import type { ICarouselItem } from "@/interfaces/carousel";
import { Calendar, Earth, FileVideo2, Pencil, Trash } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const CarouselItemFormSchemea = z.object({
  id: z.string(),
  name: z.string().min(1),
  order: z.string().min(1),
  contentUrl: z.string().max(2000),
  durationMs: z.string().min(1),
});

interface CarouselItemProps {
  carousel: ICarouselItem;
  refreshCarousels: () => void;
}

export const CarouselItem: React.FC<CarouselItemProps> = ({
  carousel,
  refreshCarousels,
}) => {
  const form = useForm<z.infer<typeof CarouselItemFormSchemea>>({
    resolver: zodResolver(CarouselItemFormSchemea),
    defaultValues: {
      id: carousel.id || "",
      name: carousel.name || "",
      order: (carousel.order || "0").toString(),
      contentUrl: carousel.contentUrl || "",
      durationMs: (carousel.durationMs || "4500").toString(),
    },
  });

  React.useEffect(() => {
    form.reset({
      id: carousel.id || "",
      name: carousel.name || "",
      order: (carousel.order || "0").toString(),
      contentUrl: carousel.contentUrl || "",
      durationMs: (carousel.durationMs || "4500").toString(),
    });
  }, [carousel]);

  const deleteItem = async (id: string | undefined) => {
    if (id === undefined) {
      console.error(
        "Trying to delete carousel item but the ID is undefined, not doing that!"
      );
      return;
    }
    if (
      !confirm(`Are you sure you want to update the delete this carousel item?`)
    ) {
      toast("Action has been cancelled");
      return;
    }

    try {
      await axios.delete(`${API_URL}/v2/carousel/item/${id}`, {
        headers: { Authorization: `Bearer ${getCookie("token")}` },
      });
      toast("Carousel item deleted!");
    } catch (error) {
      toast("Event couldn't be deleted...");
      console.error(error);
    }
    refreshCarousels();
  };

  const onEditSubmit = async (
    data: z.infer<typeof CarouselItemFormSchemea>
  ) => {
    if (
      !confirm(
        `Are you sure you want to update the carousel ${data.name} in Asgard?`
      )
    ) {
      toast("Action has been cancelled");
      return;
    }
    try {
      await axios.put(API_URL + "/v2/carousel/item/" + carousel.id, data, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });
      toast("Carousel item updated successfully");
      refreshCarousels();
    } catch (error: any) {
      console.error("There was an error!", error);
      toast(error.response.data.message || "Something went wrong");
    }
  };

  return (
    <div className="bg-zinc-200 p-5 mb-5 tablet:m-5 rounded-xl flex flex-col items-center w-full tablet:w-1/3 desktop:w-1/4">
      <div className="flex justify-between items-center w-full mb-5">
        <h1 className="font-bold">
          {carousel.name}{" "}
          <span className="font-normal text-sm">({carousel.order})</span>
        </h1>
        <Button
          variant={"ghost"}
          onClick={async (event) => {
            event.preventDefault();
            await deleteItem(carousel.id);
          }}
        >
          <Trash className="text-red-500" />
        </Button>
      </div>
      {carousel.type == "TIMETABLE" && (
        <div className="h-60 flex items-center justify-center mb-5 py-5 w-full">
          <div className="rounded-lg select-none w-auto flex flex-col items-center">
            <Calendar size={100} />
          </div>
        </div>
      )}

      {carousel.type == "PICTURE" && (
        <div className="h-60 flex items-center justify-center mb-5 py-5 w-full">
          <img
            className="rounded-lg select-none h-48 w-auto"
            src={carousel.contentUrl}
          />
        </div>
      )}

      {carousel.type == "WEB" && (
        <div className="h-60 flex items-center justify-center mb-5 py-5 w-full">
          <div className="rounded-lg select-none w-auto flex flex-col items-center">
            <Earth size={100} />
          </div>
        </div>
      )}

      {carousel.type == "VIDEO" && (
        <div className="h-60 flex items-center justify-center mb-5 py-5 w-full">
          <div className="rounded-lg select-none w-auto flex flex-col items-center">
            <FileVideo2 size={100} />
          </div>
        </div>
      )}

      <span className="font-normal text-sm">
        {carousel.durationMs / 1000} seconds
      </span>
      <div className="w-full mt-5 pt-5 border-t-2 border-black text-left">
        <Collapsible>
          <CollapsibleTrigger className="w-full">
            <div className="flex justify-between items-center w-full mb-5">
              <span>Edit Item</span>
              <Pencil />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onEditSubmit)}
                className="space-y-6 px-1"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {carousel.type !== "TIMETABLE" && (
                  <FormField
                    control={form.control}
                    name="contentUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Content URL{" "}
                          <a
                            href={carousel.contentUrl}
                            className="text-blue-800"
                            target="_blank"
                          >
                            (open)
                          </a>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="durationMs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (ms)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  variant={"constructive"}
                  type="submit"
                  className="w-full"
                >
                  Save
                </Button>
              </form>
            </Form>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};
