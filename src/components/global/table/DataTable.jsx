"use client";

import React from "react";
import PropTypes from "prop-types";
import { cn } from "@/lib/utils";

function DataTable({ columns, data, rowKey = (row, i) => row.id ?? i }) {
  return (
    <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-x-auto">
      <table className="min-w-full text-sm text-left font-medium">
        <thead className="bg-gradient-to-r from-green-100 to-green-50 text-green-900">
          <tr>
            <th className="px-6 py-4 font-semibold rounded-tl-3xl">#</th>
            {columns.map((col, i) => (
              <th
                key={i}
                className={cn(
                  "px-6 py-4 font-semibold whitespace-nowrap",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="text-center py-8 text-gray-500 italic"
              >
                No records found.
              </td>
            </tr>
          ) : (
            data.map((row, ri) => (
              <tr
                key={rowKey(row, ri)}
                className={cn(
                  ri % 2 === 0 ? "bg-white" : "bg-gray-50",
                  "hover:bg-green-50 transition-colors duration-200"
                )}
              >
                <td className="px-6 py-4 text-gray-700">{ri + 1}</td>
                {columns.map((col, ci) => (
                  <td
                    key={ci}
                    className={cn("px-6 py-4 text-gray-800", col.className)}
                  >
                    {col.render
                      ? col.render(row)
                      : col.accessor
                      ? row[col.accessor]
                      : "-"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.node.isRequired,
      accessor: PropTypes.string,
      render: PropTypes.func,
      className: PropTypes.string,
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  rowKey: PropTypes.func,
};

export default DataTable;
