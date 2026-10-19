import Link from "next/link"
import type { MDXComponents } from "mdx/types"
import { MdxPre } from "./code-block"
import { InstallCommand } from "./install-command"

export function getMDXComponents(): MDXComponents {
  return {
    InstallCommand,
    a: ({ href = "", ...props }) => href.startsWith("/")
      ? <Link href={href} prefetch={false} {...props} />
      : <a href={href} {...props} />,
    pre: MdxPre,
    table: (props) => <div className="docs-table-wrap"><table {...props} /></div>,
  }
}
