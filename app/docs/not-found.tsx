import Link from "next/link"
import { LibraryWorkspace } from "@/components/docs/library-workspace"

export default function DocsNotFound() {
  return <LibraryWorkspace name="not-found" title="Page not found" description="Choose a component from the sidebar." guide documentation={<p><Link href="/docs">Back to documentation</Link></p>} />
}
