import * as React from "react";
import axios from "axios";
import { API_URL } from "@/constants";
import { getCookie } from "@/lib/cookie";

export default function UserTest() {
  const [user, setUser] = React.useState({});

  const fetchData = async () => {
    await axios
      .get(API_URL + "/v2/user/me", {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      })
      .then((response) => {
        setUser(response.data.users[0] as any);
        console.log(user)
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <ul className="list-disc pl-5">
      <li>Didnt get stuff done</li>

      {/* <li>{user.id}</li>
      <li>{user.username}</li>
      <li>{user.shortName}</li>
      <li>{user.fullName}</li>
      <li>{user.initials}</li>
      <li>{user.role}</li>
      <li>{user.email}</li>
      <li>{user.creationDate}</li>
      <li>
        <a href={user.profilePictureUrl} target="_blank">
          {user.profilePictureUrl}
        </a>
      </li> */}
    </ul>
  );
}
