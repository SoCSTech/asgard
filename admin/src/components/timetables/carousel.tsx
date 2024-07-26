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
}

export const CarouselItem: React.FC<CarouselItemProps> = ({ carousel }) => {
  const form = useForm<z.infer<typeof CarouselItemFormSchemea>>({
    resolver: zodResolver(CarouselItemFormSchemea),
    defaultValues: {
      name: "",
      order: "0",
      contentUrl: "",
      durationMs: "4500",
    },
  });

  React.useEffect(() => {
    form.reset({
      name: carousel.name || "",
      order: (carousel.order || "0").toString(),
      contentUrl: carousel.contentUrl || "",
      durationMs: (carousel.durationMs || "4500").toString(),
    });
  }, [carousel]);

  return (
    <div className="bg-zinc-200 p-5 mb-5 tablet:m-5 rounded-xl flex flex-col items-center w-full tablet:w-1/3 desktop:w-1/4">
      <div className="flex justify-between items-center w-full mb-5">
        <h1 className="font-bold">{carousel.name} <span className="font-normal text-sm">({carousel.order})</span></h1>
        <Button
          variant={"ghost"}
          onClick={(event) => {
            event.preventDefault();
            alert("nyi");
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
                onSubmit={form.handleSubmit(console.log)}
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
                        <FormLabel>Content URL <a href={carousel.contentUrl} className="text-blue-800" target="_blank">(open)</a></FormLabel>
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
