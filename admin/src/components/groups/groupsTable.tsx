import * as React from "react";
import axios from "axios";
import { API_URL } from "@/constants";
import { getCookie } from "@/lib/cookie";
import TableList from "../theme/tableList";
import type { ITimetable } from "@/interfaces/timetable";
import { formatEnumValue } from "@/lib/enum";
import type { ITimetableGroup } from "@/interfaces/timetableGroup";

export function GroupsTable() {
  const [groups, setGroups] = React.useState([{} as ITimetableGroup]);
  const fetchData = async () => {
    await axios
      .get(API_URL + "/v2/timetable-group", {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      })
      .then((response) => {
        const data = response.data.groups
        setGroups(data);
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
      <TableList headers={["internalName", "name", "subtitle"]} data={groups} urlBase="/groups" />
    </div>
  );
}
