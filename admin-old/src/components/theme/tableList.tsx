import * as React from "react";

interface DataWithId {
  id: string;
}


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

export default function TableList<T extends DataWithId>({
  headers,
  data,
  urlBase
}: TableProps<T>) {
  return (
    <table className="w-full text-sm text-left rtl:text-right text-black dark:text-white">
      <thead className="text-xs text-white uppercase bg-black dark:bg-gray-800 dark:text-gray-400 tracking-wide">
        <tr>
          {headers.map((header) => (
            <th className="px-6 py-3" key={header as string}>
              {camelToTitle(header as string)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data && data.length > 0 ? (
          data.map((row, rowIndex) => (
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
          ))
        ) : (
          <tr>
            <td colSpan={headers.length} className="px-6 py-4 text-center">
              No results
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
