import * as React from "react";
import axios from "axios";
import { API_URL } from "@/constants";
import { getCookie } from "@/lib/cookie";
import { UserRoles, type IUser } from "@/interfaces/user";
import TableList from "../theme/tableList";
import { formatEnumValue } from "@/lib/enum";
import { toast } from "sonner";
import { Button } from "../ui/button";
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
  SheetTrigger
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
import { getErrorMessage, type IServerError } from "@/interfaces/serverError";

const UserFormSchema = z.object({
  username: z.string().min(1).max(50),
  shortName: z.string().min(1).max(50),
  fullName: z.string().min(1).max(256),
  role: z.string(),
  email: z.string().email().max(256),
});

interface CreateNewUserProps {
  fetchData: () => void;
}

const CreateNewUser: React.FC<CreateNewUserProps> = ({ fetchData }) => {
  const [newUserSheetIsOpen, setNewUserSheetIsOpen] = React.useState(false);

  const form = useForm<z.infer<typeof UserFormSchema>>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      username: "",
      shortName: "",
      fullName: "",
      role: "STANDARD",
      email: "",
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
    } catch (error: any) {
      const serverError = error as IServerError;
      console.error("There was an error!", serverError);
      toast(
        getErrorMessage(serverError, "Error checking if you have permission")
      );
      return false;
    }
  };

  const onSubmit = async (data: any) => {
    if (!checkIfUserIsTech()) {
      toast("You're not a technician! You cannot modify other users.");
      return;
    }

    if (
      !confirm(`Are you sure you want to invite ${data.fullName} to Asgard?`)
    ) {
      toast("Action has been cancelled");
      return;
    }

    try {
      await axios.post(API_URL + "/v2/user", data, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });
      toast("User created successfully");
      setNewUserSheetIsOpen(false);
      fetchData()
    } catch (error: any) {
      console.error("There was an error!", error);
      toast(error.response.data.message || "Something went wrong");
    }
  };

  return (
    <Sheet open={newUserSheetIsOpen} onOpenChange={setNewUserSheetIsOpen}>
      <SheetTrigger asChild>
        <Button variant={"primary"}>Add</Button>
      </SheetTrigger>
      <SheetContent className="w-full max-w-[540px]">
        <SheetHeader>
          <SheetTitle>Invite New User</SheetTitle>
          <SheetDescription>
            Create a user that can administer the Asgard system.
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
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shortName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Role</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a role for the user" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {UserRoles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This will control how much access a user has. A Standard
                      user has access to only the timetables they're prescribed,
                      whereas a Technician can a modify all timetables on the
                      system.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button variant={"constructive"} type="submit">
                Invite
              </Button>
            </form>
          </Form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export function UsersTable() {
  const [users, setUsers] = React.useState<IUser[]>([]);

  const fetchData = async () => {
    try {
      const response = await axios.get(API_URL + "/v2/user", {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });
      const data = response.data.users;
      if (data.length === 0) {
        toast("No users are found");
      }
      const formattedData = data.map((usr: IUser) => ({
        ...usr,
        role: formatEnumValue(usr.role),
      }));
      setUsers(formattedData);
    } catch (error: any) {
      const serverError = error as IServerError
      console.error("There was an error!", serverError);
      toast(getErrorMessage(serverError));
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <div className="flex flex-row justify-between px-2 tablet:px-10 py-0">
        <div></div>
        <h1 className="text-3xl font-extrabold text-center">Users</h1>
        <CreateNewUser fetchData={fetchData} />
      </div>
      <div className="relative overflow-x-auto tablet:shadow-md rounded-xl m-2 tablet:m-10">
        <TableList
          headers={["fullName", "username", "email", "role"]}
          data={users}
          urlBase="/users"
        />
      </div>
    </>
  );
}
