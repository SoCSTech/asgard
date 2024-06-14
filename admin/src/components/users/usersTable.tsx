import * as React from "react";
import axios from "axios";
import { API_URL } from "@/constants";
import { getCookie } from "@/lib/cookie";
import type { IUser } from "@/interfaces/user";
import TableList from "../theme/tableList";

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

  return (
    <div className="relative overflow-x-auto shadow-md mt-5 rounded-xl">
      <TableList headers={["fullName", "username", "email", "role"]} data={users} urlBase="/users" />
    </div>
  );
}
