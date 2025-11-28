"use client"

import { ReactNode, useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  ColumnResizeMode,
} from "@tanstack/react-table"

interface Column<T> {
  key: string
  header: string | ReactNode
  width?: string
  align?: "left" | "center" | "right"
  sortable?: boolean
  render?: (row: T, index: number) => ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  onSort?: (key: string) => void
  sortKey?: string
  sortDirection?: "asc" | "desc"
  emptyMessage?: string
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading,
  onSort,
  sortKey,
  sortDirection,
  emptyMessage = "데이터가 없습니다."
}: DataTableProps<T>) {
  const [columnResizeMode] = useState<ColumnResizeMode>("onChange")

  const handleSort = (key: string, sortable?: boolean) => {
    if (sortable && onSort) {
      onSort(key)
    }
  }

  const getAlignClass = (align?: "left" | "center" | "right") => {
    switch (align) {
      case "center":
        return "text-center"
      case "right":
        return "text-right"
      default:
        return "text-left"
    }
  }

  // TanStack Table 컬럼 정의로 변환
  const tanstackColumns: ColumnDef<T>[] = columns.map((col, index) => ({
    id: col.key,
    accessorKey: col.key,
    header: () => col.header,
    cell: (info) => {
      const row = info.row.original
      const rowIndex = info.row.index
      return col.render ? col.render(row, rowIndex) : info.getValue()
    },
    size: col.width ? parseInt(col.width) : 150,
    minSize: 50,
    maxSize: 500,
  }))

  const table = useReactTable({
    data,
    columns: tanstackColumns,
    columnResizeMode,
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: true,
  })

  if (loading) {
    return (
      <div className="bg-white border border-gray-300 rounded">
        <div className="p-8 text-center text-gray-500">
          로딩 중...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-300 overflow-hidden w-full">
      <div className="overflow-x-auto">
        <table className="text-xs border-collapse w-full">
          <thead className="bg-[#5F7C94] text-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, headerIndex) => {
                  const column = columns[headerIndex]
                  return (
                    <th
                      key={header.id}
                      className={`px-2 py-3 font-medium border-r border-white last:border-r-0 ${getAlignClass(column?.align)} relative`}
                      style={{ width: header.getSize() }}
                    >
                      <div
                        className={`flex items-center gap-1 justify-center ${column?.sortable ? "cursor-pointer select-none" : ""}`}
                        onClick={() => handleSort(column?.key || "", column?.sortable)}
                      >
                        <span className="text-xs whitespace-nowrap">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                      </div>
                      {/* 리사이징 핸들 */}
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none hover:bg-blue-400 ${
                          header.column.getIsResizing() ? "bg-blue-500" : ""
                        }`}
                        style={{
                          transform: header.column.getIsResizing()
                            ? `translateX(${table.getState().columnSizingInfo.deltaOffset}px)`
                            : "",
                        }}
                      />
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody className="bg-[#E8EAED]">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-8 text-center text-gray-500 bg-white"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-300 last:border-b-0 hover:bg-[#DDE0E4]"
                >
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    const column = columns[cellIndex]
                    return (
                      <td
                        key={cell.id}
                        className={`px-2 py-1.5 border-r border-gray-300 last:border-r-0 ${getAlignClass(column?.align)} text-xs text-gray-800`}
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
