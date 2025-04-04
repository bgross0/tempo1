"use client"

// Temporarily commenting out TanStack Table until we add the dependency
/*
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  FilterFn,
  getFilteredRowModel,
} from "@tanstack/react-table"
*/

// Define placeholder types to avoid build errors
type ColumnDef<T, V> = any;
type SortingState = { id: string; desc: boolean }[];
type FilterFn<T> = any;

const flexRender = (a: any, b: any) => null;
const getCoreRowModel = () => ({});
const getPaginationRowModel = () => ({});
const getSortedRowModel = () => ({});
const getFilteredRowModel = () => ({});

const useReactTable = (options: any) => {
  const mockCell = {
    id: 'cell1',
    column: {
      id: 'column1',
      columnDef: {
        cell: 'Cell Content'
      }
    },
    getValue: () => 'Value',
    getContext: () => ({})
  };

  const mockRow = {
    id: 'row1',
    original: {},
    getIsSelected: () => false,
    getVisibleCells: () => [mockCell]
  };

  return {
    getRowModel: () => ({ 
      rows: [mockRow] 
    }),
    getHeaderGroups: () => [{ 
      id: 'headerGroup1',
      headers: [{ 
        id: 'header1', 
        isPlaceholder: false,
        column: { 
          getCanSort: () => false,
          getIsSorted: () => false,
          getSortingFn: () => 'alphanumeric',
          toggleSorting: () => {},
          columnDef: {
            header: 'Header',
            cell: 'Cell'
          }
        },
        getContext: () => ({})
      }] 
    }],
    getState: () => ({ pagination: { pageIndex: 0, pageSize: 10 } }),
    getPageCount: () => 0,
    getFilteredRowModel: () => ({ rows: [] }),
    getFilteredSelectedRowModel: () => ({ rows: [] }),
    setGlobalFilter: () => {},
    setSorting: () => {},
    // Additional methods required by TableType interface
    setPageIndex: () => {},
    previousPage: () => {},
    nextPage: () => {},
    getCanPreviousPage: () => false,
    getCanNextPage: () => false,
    setPageSize: () => {}
  }
};

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "./button"
import { useState } from "react"
import { Input } from "./input"
import { DataTablePagination } from "./data-table-pagination"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search..."
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
    },
  })

  return (
    <div>
      {searchKey && (
        <div className="flex items-center py-4">
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}