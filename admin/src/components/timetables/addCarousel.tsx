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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "../ui/scroll-area";
import { getErrorMessage, type IServerError } from "@/interfaces/serverError";

const CarouselItemFormSchemea = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  contentUrl: z.string().max(2000),
  durationMs: z.string().min(1),
});

interface AddCarouselProps {
  refreshCarousels: () => void;
  carouselId: string;
}

export const AddCarousel: React.FC<AddCarouselProps> = ({
  refreshCarousels,
  carouselId,
}) => {
  const [sheetIsOpen, setSheetIsOpen] = React.useState(false);

  const form = useForm<z.infer<typeof CarouselItemFormSchemea>>({
    resolver: zodResolver(CarouselItemFormSchemea),
    defaultValues: {
      name: "",
      type: "TIMETABLE",
      contentUrl: "",
      durationMs: "4500",
    },
  });

  const onSubmit = async (data: z.infer<typeof CarouselItemFormSchemea>) => {
    console.log("Form submitted", data);

    if (
      !confirm(
        `Are you sure you want to update the carousel ${data.name} in Asgard?`
      )
    ) {
      toast("Action has been cancelled");
      return;
    }

    try {
      await axios.post(
        API_URL + "/v2/carousel/item",
        {
          ...data,
          carousel: carouselId,
        },
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
          },
        }
      );
      toast("Carousel item updated successfully");
      refreshCarousels();
      setSheetIsOpen(false);
      form.reset({
        name: "",
        type: "TIMETABLE",
        contentUrl: "",
        durationMs: "4500",
      });
    } catch (error: any) {
      const serverError = error as IServerError;
      console.error("There was an error!", serverError);
      toast(getErrorMessage(serverError));
    }
  };

  return (
    <Sheet open={sheetIsOpen} onOpenChange={setSheetIsOpen}>
      <SheetTrigger asChild>
        <Button variant="primary">Add Item</Button>
      </SheetTrigger>
      <SheetContent className="w-full max-w-[540px]">
        <SheetHeader>
          <SheetTitle>Create New Carousel Item</SheetTitle>
          <SheetDescription className="mb-5">
            Create a new item to show on the carousels of the room displays.
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Name<span className="text-destructive">*</span>
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
                name="type"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      Type<span className="text-destructive">*</span>
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select item type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem key="TIMETABLE" value="TIMETABLE">
                            Timetable
                          </SelectItem>
                          <SelectItem key="PICTURE" value="PICTURE">
                            Picture
                          </SelectItem>
                          <SelectItem key="VIDEO" value="VIDEO">
                            Video
                          </SelectItem>
                          <SelectItem key="WEB" value="WEB">
                            Website
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("type", "TIMETABLE") !== "TIMETABLE" && (
                <FormField
                  control={form.control}
                  name="contentUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Content URL<span className="text-destructive">*</span>
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
                    <FormLabel>
                      Duration (ms)<span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button variant="constructive" type="submit">
                Create
              </Button>
            </form>
          </Form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
