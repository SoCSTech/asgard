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
import type { ICarouselItem } from "@/interfaces/carousel";
import { Calendar, ChevronDown, Pencil, Trash } from "lucide-react";
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

  return (
    <div className="bg-zinc-200 p-5 m-5 rounded-xl flex flex-col items-center w-1/4">
      <div className="flex justify-between items-center w-full mb-5">
        <h1 className="font-bold">{carousel.name}</h1>
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
        <div className="border border-blue-800 w-full flex items-center justify-center my-5 py-5">
          <Calendar />
        </div>
      )}

      {carousel.type == "PICTURE" && (
        <img className="rounded-lg select-none" src={carousel.contentUrl} />
      )}

      <div className="w-full mt-5 pt-5 border-t-2 border-black text-left">
        <Collapsible>
          <CollapsibleTrigger className="w-full">
            <div className="flex justify-between items-center w-full">
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

                <FormField
                  control={form.control}
                  name="contentUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content URL</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
