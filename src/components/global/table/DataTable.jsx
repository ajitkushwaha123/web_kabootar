// DataTable.jsx
"use client";

import React from "react";
import PropTypes from "prop-types";
import { cn } from "@/lib/utils";

function DataTable({ columns, data, rowKey = (row, i) => row.id ?? i }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-x-auto">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-green-50 text-green-800 text-sm">
          <tr className="border-b border-green-100">
            {columns.map((col, i) => (
              <th
                key={i}
                className={cn("px-6 py-4 font-semibold", col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {data.map((row, ri) => (
            <tr
              key={rowKey(row, ri)}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              {columns.map((col, ci) => (
                <td key={ci} className={cn("px-6 py-4", col.className)}>
                  {col.render
                    ? col.render(row)
                    : col.accessor
                    ? row[col.accessor]
                    : null}
                </td>
              ))}
            </tr>
          ))}
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
