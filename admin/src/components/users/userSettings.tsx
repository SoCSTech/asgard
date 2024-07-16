import * as React from "react";
import axios from "axios";
import { API_URL } from "@/constants";
import { getCookie } from "@/lib/cookie";
import type { IUser } from "@/interfaces/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatEnumValue } from "@/lib/enum";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UserRoles } from "@/interfaces/user";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import md5 from "md5";

export default function UserSettings() {
  const [user, setUser] = React.useState({} as IUser);
  const fetchData = async () => {
    await axios
      .get(API_URL + "/v2/user/me", {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      })
      .then((response) => {
        setUser(response.data.users[0]);
        let data = response.data.users[0];
        data.role = formatEnumValue(data.role);
        setUser(data);

        if (data.length == 0) {
          toast("Can't find user");
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

  const UserFormSchema = z.object({
    id: z.string(),
    username: z.string().min(1).max(50),
    shortName: z.string().min(1).max(50),
    fullName: z.string().min(1).max(256),
    initials: z.string().min(1).max(3),
    role: z.string(),
    email: z.string().max(256),
    profilePictureUrl: z.string().max(256),
  });

  const handleSubmit = async (data: z.infer<typeof UserFormSchema>) => {
     await axios
       .put(API_URL + "/v2/user/" + data.id, {
        ...data
       }, {
         headers: {
           Authorization: `Bearer ${getCookie("token")}`,
         },
       })
       .then((response) => {
         toast(response.data.message)
         fetchData()
       })
       .catch((error) => {
         console.error("There was an error!", error);
         toast(error.message || "Something went wrong");
         fetchData()
       });
  };

  const newUserForm = (user: IUser | null) => {
    const form = useForm<z.infer<typeof UserFormSchema>>({
      resolver: zodResolver(UserFormSchema),
      defaultValues: {
        id: user?.id || "",
        fullName: user?.fullName || "",
        shortName: user?.shortName || "",
        email: user?.email || "",
        username: user?.username || "",
        initials: user?.initials || "",
        profilePictureUrl: user?.profilePictureUrl || "",
        role: user?.role || "",
      },
    });

    React.useEffect(() => {
      form.reset({
        id: user?.id || "",
        fullName: user?.fullName || "",
        shortName: user?.shortName || "",
        email: user?.email || "",
        username: user?.username || "",
        initials: user?.initials || "",
        profilePictureUrl: user?.profilePictureUrl || "",
        role: user?.role || "",
      });
    }, [user, form]);

    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
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
                <FormDescription>
                  Hi {field.value}!
                </FormDescription>
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
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  This is the email address we use to send you system
                  notifications, use your work email.
                </FormDescription>
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
                <FormDescription>
                    Used to sign you into Asgard, this should be your corporate username.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="initials"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Initials</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="profilePictureUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profile Picture</FormLabel>
                <div className="flex items-center">
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                  <Button
                    variant={"primaryOutline"}
                    className="ml-5"
                    onClick={() => {
                      const email = md5(form.getValues("email"));
                      form.setValue(
                        "profilePictureUrl",
                        `https://www.gravatar.com/avatar/${email}`
                      );
                    }}
                  >
                    Use Gravatar
                  </Button>
                </div>
                <FormDescription>
                  We don't currently have a way to store profile images within
                  Asgard. You can configure a{" "}
                  <a className="underline hover:no-underline" href="https://gravatar.com/" target="_blank">
                    Gravatar
                  </a> which will host your image for you and it will display all across the web. Or you can give us your GitHub profile picture by setting the URL to <code>https://github.com/your-username.png</code>
                </FormDescription>
              </FormItem>
            )}
          />
          <Button
            className="w-full mt-20"
            variant={"constructive"}
            type="submit"
          >
            Save Changes
          </Button>
        </form>
      </Form>
    );
  };

  return (
    <div className="w-full text-xl flex flex-col p-10 pt-0">
      <div className="flex items-center">
        <Avatar className="w-[250px] h-[250px] mb-5 p-10">
          <AvatarImage src={user.profilePictureUrl} alt={user.fullName} />
          <AvatarFallback className="text-7xl">{user.initials}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <h1 className="font-extrabold text-4xl">{user.fullName}</h1>
          <h2 className="font-medium text 3xl">
            {user.role} - Joined{" "}
            {new Date(user.creationDate).toLocaleDateString()}
          </h2>
        </div>

        <div className="ml-5">
          <Button
            className="mx-2"
            variant={"destructive"}
            onClick={() => (window.location.href = "/logout")}
          >
            Logout
          </Button>
        </div>
      </div>

      <div>{newUserForm(user)}</div>
    </div>
  );
}
