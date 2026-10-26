"use client"

import * as React from "react"

import { ScrollRail } from "@/components/ui/scroll-rail"

type ArticleBlock = {
  id: string
  title: string
  kind: "heading" | "subheading" | "body"
  text: string
}

type ArticleGroup = {
  title: string
  blocks: ArticleBlock[]
}

const chapters: ArticleGroup[] = [
  {
    title: "Introduction",
    blocks: [
      {
        id: "proximity-sidebar",
        title: "Proximity Sidebar",
        kind: "heading",
        text: "A compact document minimap turns headings and paragraph rhythm into interactive dashes. Every dash rests at the same short length, nearby marks expand toward the pointer, and the active mark brightens as you read.",
      },
      {
        id: "document-length",
        title: "A map of the page",
        kind: "body",
        text: "The rail gives readers a sense of document length without adding another table of contents. Each dash points to real content, so the minimap stays connected to the page instead of feeling decorative.",
      },
      {
        id: "pointer-proximity",
        title: "Pointer proximity",
        kind: "body",
        text: "Nearby dashes expand continuously as the pointer moves along the rail. The change is restrained at rest and becomes easier to read only near the pointer.",
      },
      {
        id: "reading-structure",
        title: "Reading structure",
        kind: "body",
        text: "Major titles, secondary headings, and paragraphs each get their own mark. The equal lengths keep the map calm while the article itself carries the hierarchy.",
      },
      {
        id: "jump-to-content",
        title: "Jump to content",
        kind: "body",
        text: "Select any dash to move to its matching block. Keyboard focus uses the same preview and arrow keys move through the document in order.",
      },
      {
        id: "quiet-feedback",
        title: "Quiet feedback",
        kind: "body",
        text: "The current block gets one brighter mark. When the active section changes, the previous mark returns to its quiet opacity; every dash keeps the same length.",
      },
    ],
  },
  {
    title: "Structure",
    blocks: [
      {
        id: "content-model",
        title: "Content Model",
        kind: "heading",
        text: "The sidebar reflects the sections you provide. That keeps the visual hierarchy predictable and makes the rail easy to tune for a different document.",
      },
      {
        id: "title-marks",
        title: "Title marks",
        kind: "subheading",
        text: "A title mark points to a major region of the document. It rests at the same short length as every other mark, then grows only when the pointer approaches.",
      },
      {
        id: "title-detail",
        title: "Major regions",
        kind: "body",
        text: "Use title marks for introductions, large feature areas, installation steps, or other sections that readers may want to revisit.",
      },
      {
        id: "subtitle-marks",
        title: "Subtitle marks",
        kind: "subheading",
        text: "Subtitles use the same resting mark as titles and body sections. Their place in the article remains clear without adding visual noise to the rail.",
      },
      {
        id: "subtitle-detail",
        title: "Useful groupings",
        kind: "body",
        text: "A subtitle can represent a feature group, a configuration step, an API category, or a meaningful turn in a longer explanation.",
      },
      {
        id: "section-marks",
        title: "Section marks",
        kind: "subheading",
        text: "Every section mark stays on the same regular rhythm. Group labels appear in the hover preview without interrupting the rail with extra gaps.",
      },
      {
        id: "section-detail",
        title: "Group labels",
        kind: "body",
        text: "Set a group to show its label in the preview. The marks keep an even rhythm from top to bottom, even when the group changes.",
      },
      {
        id: "body-marks",
        title: "Body marks",
        kind: "subheading",
        text: "Body sections use the same quiet mark as every other item. A dense page can show more destinations without turning the rail into a pattern of competing lengths.",
      },
      {
        id: "body-detail",
        title: "Content density",
        kind: "body",
        text: "Any mark expands when the pointer passes nearby. The active section brightens but keeps its original length, so the rail stays even while you read.",
      },
    ],
  },
  {
    title: "Interaction",
    blocks: [
      {
        id: "pointer-response",
        title: "Pointer Response",
        kind: "heading",
        text: "Proximity is measured from the center of each mark. A smooth falloff gives nearby dashes a connected response without changing their position in the rail.",
      },
      {
        id: "proximity-range",
        title: "Proximity range",
        kind: "subheading",
        text: "The range spans a small group of neighboring marks. Moving the pointer farther away returns them to their original width and opacity.",
      },
      {
        id: "scroll-response",
        title: "Scroll response",
        kind: "subheading",
        text: "Scrolling updates the active mark from the block nearest the reading line. The position follows the article without requiring the reader to point at the rail.",
      },
      {
        id: "scroll-response-detail",
        title: "Current location",
        kind: "body",
        text: "The rail checks the same scroll container as the article. When the last block reaches the end of the view, the final mark becomes active as well.",
      },
      {
        id: "keyboard-navigation",
        title: "Keyboard navigation",
        kind: "subheading",
        text: "Focus a mark and use the arrow keys to move through the list. Home and End jump to the first and last marks, and Enter selects the focused block.",
      },
      {
        id: "reduced-motion",
        title: "Reduced motion",
        kind: "subheading",
        text: "When reduced motion is enabled, the rail changes directly to its next state. It stays useful without running spring animations.",
      },
    ],
  },
  {
    title: "Customization",
    blocks: [
      {
        id: "tuning-the-rail",
        title: "Tuning the Rail",
        kind: "heading",
        text: "The minimap can follow any long-form content. Give each item a stable ID, a short label, and an optional group for the hover preview.",
      },
      {
        id: "dash-widths",
        title: "Dash lengths",
        kind: "subheading",
        text: "Every dash starts at the same short length. Nearby dashes grow with a smooth falloff, while the active section is shown through brightness alone.",
      },
      {
        id: "custom-groups",
        title: "Groups and labels",
        kind: "subheading",
        text: "Set a group to show its label in the floating preview. Titles and excerpts appear when a reader hovers or focuses a mark.",
      },
      {
        id: "scroll-container",
        title: "Scrollable containers",
        kind: "subheading",
        text: "Pass the element that owns scrolling as container. This keeps activation and click navigation inside the article even when the surrounding page also scrolls.",
      },
    ],
  },
]

// every content block gets the same small resting dash; only pointer proximity changes its length
export function RailDemo() {
  const [scroller, setScroller] = React.useState<HTMLDivElement | null>(null)
  const items = React.useMemo(
    () => chapters.flatMap((chapter) => chapter.blocks.map((block) => ({
      id: block.id,
      title: block.title,
      excerpt: block.text,
      group: chapter.title,
    }))),
    []
  )

  return (
    <div className="@container relative h-[min(760px,88vh)] min-h-[500px] w-full min-w-0">
      <ScrollRail
        items={items}
        container={scroller}
        side="left"
        className="absolute top-1/2 left-5 -translate-y-1/2 @min-[640px]:left-8"
      />
      <div
        ref={setScroller}
        className="h-full overflow-y-auto pl-[116px] pr-5 pt-14 pb-20 @min-[640px]:pl-[208px] @min-[640px]:pr-8 @min-[1040px]:pl-[220px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <article className="w-full max-w-[620px]">
          {chapters.map((chapter) => (
            <section key={chapter.title} className="mb-14">
              <p className="mb-3 text-[13px] text-foreground/45">{chapter.title}</p>
              <div className="space-y-7">
                {chapter.blocks.map((block) => {
                  const heading = block.kind === "heading"
                  const subheading = block.kind === "subheading"
                  const mainTitle = block.id === "proximity-sidebar"
                  const Heading = mainTitle ? "h1" : heading ? "h2" : "h3"
                  return (
                    <div key={block.id} data-rail-id={block.id} className="scroll-mt-8">
                      {heading || subheading ? (
                        <Heading className={
                          mainTitle
                            ? "text-[clamp(34px,3.2vw,42px)] leading-[1.08] font-semibold tracking-[-0.035em]"
                            : heading
                              ? "border-b border-foreground/20 pb-2 text-[26px] leading-tight font-semibold tracking-tight"
                              : "text-[17px] leading-snug font-medium tracking-tight text-foreground/90"
                        }>
                          {block.title}
                        </Heading>
                      ) : null}
                      <p className={mainTitle ? "mt-2 text-[16px] leading-relaxed text-foreground/55" : "mt-3 text-[14px] leading-[1.75] text-foreground/55"}>
                        {block.text}
                      </p>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </article>
      </div>
    </div>
  )
}
