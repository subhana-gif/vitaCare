import React from "react";

interface Column {
  header: string;
  accessor: string | ((row: any) => React.ReactNode);
}

interface CommonTableProps {
  data: any[];
  columns: Column[];
  loading: boolean;
  error: string;
}

const CommonTable: React.FC<CommonTableProps> = ({ data, columns, loading, error }) => {
  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              {columns.map((col, index) => (
                <th key={index} className="border p-2">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="text-center">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="border p-2">
                    {typeof col.accessor === "function"
                      ? col.accessor(row)
                      : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CommonTable;
