import * as React from "react";
import axios from "axios";
import { API_URL } from "@/constants";
import { getCookie } from "@/lib/cookie";
import type { ITimetable } from "@/interfaces/timetable";
import { formatEnumValue } from "@/lib/enum";
import { toast } from "sonner";
import { Clock4Icon, FastForwardIcon } from "lucide-react";

const convertNowNextToTitle = (nownext: any) => {
  if (nownext?.nothing) {
    return "Nothing";
  } else {
    let timeNow = new Date();
    let timeStart = new Date(nownext?.start || "");
    let timeEnd = new Date(nownext?.end || "");

    const diffMinutes = (date1: Date, date2: Date): number => {
      return Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60));
    };

    const formatDuration = (minutes: number): string => {
      if (minutes < 60) {
        return `${minutes} mins`;
      } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours} hour${hours > 1 ? "s" : ""} ${remainingMinutes} mins`;
      }
    };

    if (timeStart > timeNow) {
      let minutesUntilStart = diffMinutes(timeNow, timeStart);
      return (
        `${nownext?.name} (starts in ${formatDuration(minutesUntilStart)})` ||
        "Unknown"
      );
    } else {
      let minutesUntilEnd = diffMinutes(timeNow, timeEnd);
      return (
        `${nownext?.name} (ends in ${formatDuration(minutesUntilEnd)})` ||
        "Unknown"
      );
    }
  }
};

function TimetableCard({ timetable }: { timetable: ITimetable }) {
  const [nowNext, setNowNext] = React.useState<{ now?: any; next?: any }>({});

  const fetchNowNext = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/v2/timetable/${timetable.id}/now-next`,
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
          },
        }
      );
      const data = response.data;
      setNowNext(data);
      if (Object.keys(data).length === 0) {
        toast(`Couldn't get now and next for ${timetable.name}`);
      }
    } catch (error) {
      console.error("There was an error!", error);
      toast("Something went wrong!");
    }
  };

  React.useEffect(() => {
    fetchNowNext();
    const intervalId = setInterval(fetchNowNext, 30000); // Fetch every 30 seconds
    return () => clearInterval(intervalId); // Clear the interval on component unmount
  }, [timetable.id]);

  return (
    <a href={`/timetables/${timetable.id}`}>
      <div className="flex flex-col relative overflow-x-auto tablet:shadow-md m-5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-muted dark:hover:bg-muted-foreground p-10 min-w-15 min-h-[360px]">
        <div className="mb-5">
          <h2 className="text-xl font-semibold">{timetable.spaceCode}</h2>
          <p className="text-md">{timetable.name}</p>
        </div>
        <div className="mb-5">
          <h3 className="text-md flex font-bold">
            <Clock4Icon className="mr-2" /> Now
          </h3>
          <p>{convertNowNextToTitle(nowNext.now)}</p>
        </div>
        <div>
          <h3 className="text-md flex font-bold">
            <FastForwardIcon className="mr-2" /> Next
          </h3>
          <p>{convertNowNextToTitle(nowNext.next)}</p>
        </div>
      </div>
    </a>
  );
}

export function MyTimetables() {
  const [timetables, setTimetables] = React.useState<ITimetable[]>([]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/v2/timetable/my`, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });
      const data = response.data.timetables;
      if (data.length === 0) {
        toast("No timetables are found");
      } else {
        const newData = data.map((tt: ITimetable) => ({
          ...tt,
          dataSource: formatEnumValue(tt.dataSource),
        }));
        setTimetables(newData);
      }
    } catch (error) {
      console.error("There was an error!", error);
      toast("Something went wrong!");
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-4">
      {timetables.map((timetable) => (
        <TimetableCard key={timetable.id} timetable={timetable} />
      ))}
    </div>
  );
}
