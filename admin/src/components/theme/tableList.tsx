import * as React from "react";
import axios from "axios";
import { API_URL } from "@/constants";
import { getCookie } from "@/lib/cookie";
import type { IUser } from "@/interfaces/user";

interface TableProps<T> {
  headers: (keyof T)[];
  data: T[];
  urlBase: string;
}

const camelToTitle = (camelCase: string): string => {
  return camelCase
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter
    .replace(/\s+/g, " "); // Ensure single space separation
};

export default function TableList<T>({
  headers,
  data,
  urlBase,
}: TableProps<T>) {
  return (
    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 rounded">
        <tr>
          {headers.map((header) => (
            <th className="px-6 py-3" key={header as string}>
              {camelToTitle(header as string)}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
            onClick={() => (window.location.href = urlBase + "/" + row.id)}
          >
            {headers.map((header) => (
              <td className="px-6 py-4" key={header as string}>
                {row[header] as React.ReactNode}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
