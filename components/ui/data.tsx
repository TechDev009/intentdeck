import * as React from "react"
import { cn } from "../../lib/utils"

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="u-table-wrap">
      <table className={cn("u-table", className)} {...props} />
    </div>
  )
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn(className)} {...props} />
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn(className)} {...props} />
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("u-tr", className)} {...props} />
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("u-th", className)} {...props} />
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("u-td", className)} {...props} />
}

export function Alert({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "destructive" }) {
  return <div role="alert" className={cn("u-alert", variant === "destructive" && "u-alert-bad", className)} {...props} />
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h4 className={cn("u-alert-title", className)} {...props} />
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("u-alert-desc", className)} {...props} />
}

export function Breadcrumb({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <nav aria-label="breadcrumb" className={cn("u-crumb", className)} {...props} />
}

export function BreadcrumbList({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) {
  return <ol className={cn("u-crumb-list", className)} {...props} />
}

export function BreadcrumbItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn("u-crumb-item", className)} {...props} />
}

export function BreadcrumbSeparator({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return <li aria-hidden="true" className={cn("u-crumb-sep", className)} {...props}>/</li>
}

export function Pagination({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <nav aria-label="pagination" className={cn("u-pager", className)} {...props} />
}

export function PaginationList({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn("u-pager-list", className)} {...props} />
}

export function PaginationButton({ className, active, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return <button type="button" aria-current={active ? "page" : undefined} className={cn("u-pager-btn", active && "u-pager-active", className)} {...props} />
}
