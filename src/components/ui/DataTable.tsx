import { cn } from "@/lib/utils";

interface Column<T> {
  key:       string;
  header:    string;
  accessor:  (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns:    Column<T>[];
  data:       T[];
  keyFn:      (row: T) => string;
  emptyState?: React.ReactNode;
  className?:  string;
  loading?:    boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyFn,
  emptyState,
  className,
  loading = false,
}: DataTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-border", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-neutral-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-border">
          {loading ? (
            // Skeleton rows
            Array.from({ length: 4 }).map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 bg-neutral-100 rounded animate-shimmer" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center">
                {emptyState ?? (
                  <p className="text-sm text-neutral-400">No data found.</p>
                )}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyFn(row)}
                className="hover:bg-neutral-50 transition-colors duration-100"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-neutral-700 whitespace-nowrap",
                      col.className
                    )}
                  >
                    {col.accessor(row)}
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
