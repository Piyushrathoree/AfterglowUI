import "server-only"

import type { BundledLanguage } from "shiki"
import { isValidElement, type ComponentProps, type ReactNode } from "react"
import { getRegistrySources, highlightCode } from "@/lib/docs/source-code"
import { CopyButton } from "./copy-button"

export async function CodeBlock({ code, language = "tsx", title }: { code: string; language?: BundledLanguage; title?: string }) {
  const html = await highlightCode(code, language)
  return (
    <div className="docs-code">
      {title && <div className="docs-code-title">{title}</div>}
      <CopyButton text={code.trim()} />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}

function textContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textContent).join("")
  if (isValidElement<{ children?: ReactNode }>(node)) return textContent(node.props.children)
  return ""
}

export function MdxPre({ children, ...props }: ComponentProps<"pre">) {
  return <div className="docs-code"><CopyButton text={textContent(children).trimEnd()} /><pre {...props}>{children}</pre></div>
}

export async function SourceFiles({ name }: { name: string }) {
  const files = await getRegistrySources(name)
  if (!files) throw new Error(`Unknown registry component: ${name}`)
  return (
    <div className="docs-source-files">
      {files.map((file, index) => (
        <details key={file.path} open={index === 0}>
          <summary>{file.path}</summary><CodeBlock code={file.code} />
        </details>
      ))}
    </div>
  )
}
