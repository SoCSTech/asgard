import * as React from "react";
import axios from "axios";
import { API_URL } from "@/constants";
import { getCookie } from "@/lib/cookie";
import TableList from "../theme/tableList";
import type { ITimetable } from "@/interfaces/timetable";
import { formatEnumValue } from "@/lib/enum";
import { toast } from "sonner";

export function TimetablesTable() {
  const [timetables, setTimetables] = React.useState([{} as ITimetable]);
  const fetchData = async () => {
    await axios
      .get(API_URL + "/v2/timetable", {
        
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      })
      .then((response) => {
        const data = response.data.timetables
        let newData: ITimetable[] = []

        if (data.length == 0) {
          toast("No timetables are found");
        }
        
        data.map((tt: ITimetable) => {
          let newTimetable = tt;
          newTimetable.dataSource = formatEnumValue(tt.dataSource)
          newData.push(newTimetable)
        })

        console.log(newData)
        setTimetables(newData);
      })
      .catch((error) => {
        console.error("There was an error!", error);
        toast(error.message);
      });
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="relative overflow-x-auto tablet:shadow-md mt-5 rounded-xl">
      <TableList
        headers={["spaceCode", "name", "capacity", "dataSource"]}
        data={timetables}
        urlBase="/timetables"
      />
    </div>
  );
}
