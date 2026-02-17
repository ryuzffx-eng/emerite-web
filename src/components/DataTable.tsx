import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No data found",
  isLoading,
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-8 backdrop-blur-sm">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-[#111111]/80 overflow-hidden backdrop-blur-md shadow-2xl shadow-black/20 group/table transition-all duration-500">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-zinc-900/50">
            <TableRow className="border-b border-zinc-800/80 hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    "h-12 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest",
                    column.className
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-40 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-sm font-medium text-zinc-400">{emptyMessage}</p>
                    <p className="text-xs text-zinc-600">No records matching your criteria were found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, i) => (
                <TableRow
                  key={keyExtractor(item)}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={cn(
                    "border-b border-zinc-800/50 hover:bg-emerald-500/[0.02] last:border-0 transition-colors duration-300 group/row",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className={cn("px-6 py-4", column.className)}>
                      <div className="transition-transform duration-300 group-hover/row:translate-x-0.5">
                        {column.render
                          ? column.render(item)
                          : (item as any)[column.key]}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
