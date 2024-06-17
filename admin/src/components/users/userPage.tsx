import * as React from "react";
import axios from "axios";
import { API_URL } from "@/constants";
import { getCookie } from "@/lib/cookie";
import type { IUser } from "@/interfaces/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail } from "lucide-react";
import { Button } from "../ui/button";
import { formatEnumValue } from "@/lib/enum";

interface Props {
  userId: string;
}

export function UserPage(props: Props) {
  const [user, setUser] = React.useState({} as IUser);
  const fetchData = async () => {
    await axios
      .get(API_URL + "/v2/user/" + props.userId, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      })
      .then((response) => {
        setUser(response.data.users[0]);
         let data = response.data.users[0];
         data.role = formatEnumValue(data.role)
         setUser(data);
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  };

  const deactivateUser = async () => {
    await axios
      .delete(API_URL + "/v2/user/" + props.userId, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      })
      .then((response) => {
        console.log("user deleted!!")
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="w-full text-xl flex flex-col items-center text-center p-10 pt-0">
      <div className="flex flex-col items-center p-10 rounded-3xl">
        <Avatar className="w-[200px] h-[200px] mb-5">
          <AvatarImage src={user.profilePictureUrl} alt={user.fullName} />
          <AvatarFallback className="text-7xl">{user.initials}</AvatarFallback>
        </Avatar>

        <h1 className="font-extrabold text-3xl mb-5">{user.fullName}</h1>
      </div>

      <div className="text-left">
        <ul>
          <li>
            <strong>Username: </strong>
            {user.username}
          </li>

          <li>
            <strong>Email: </strong>
            <a href={"mailto:" + user.email}>{user.email}</a>
          </li>

          <li>
            <strong>Id: </strong>
            {user.id}
          </li>

          <li>
            <strong>Role: </strong>
            {user.role}
          </li>

          <li>
            <strong>Account Created: </strong>
            {new Date(user.creationDate).toLocaleString()}
          </li>
        </ul>
      </div>

      <div className="mt-10 bg-black p-5 rounded-xl">
        <Button className="mx-2" variant={"primaryOutline"}>Edit</Button>
        <Button className="mx-2" variant={"primaryOutline"}>Reset Password</Button>
        <Button className="mx-2" variant={"destructive"} onClick={() => deactivateUser()}>Deactivate</Button>
      </div>
    </div>
  );
}
