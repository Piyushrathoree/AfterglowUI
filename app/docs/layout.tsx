import type { ReactNode } from "react"
import { LibraryShell } from "@/components/docs/library-shell"
import "@/components/docs/library.css"

export default function DocsLayout({ children }: { children: ReactNode }) {
  return <LibraryShell>{children}</LibraryShell>
}
