import * as React from "react";
import axios from "axios";
import { API_URL } from "@/constants";
import { getCookie } from "@/lib/cookie";
import type { IUser } from "@/interfaces/user";

export function UsersTable() {
  const [users, setUsers] = React.useState([{} as IUser]);
  const fetchData = async () => {
    await axios
      .get(API_URL + "/v2/user", {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      })
      .then((response) => {
        setUsers(response.data.users);
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const userCard = () => {
    return users.map((user) => (
      <li>
        <a href={`/users/${user.id}`}>
          {user.fullName} - {user.username} ({user.id})
        </a>
      </li>
    ));
  };
  return (
    <div className="w-full">
      <ul className="list-disc">{userCard()}</ul>
    </div>
  );
}
