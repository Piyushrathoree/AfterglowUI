import fs from 'node:fs'
import ts from 'typescript'
const registry = JSON.parse(fs.readFileSync('registry.json', 'utf8'))
const examples = JSON.parse(fs.readFileSync('lib/docs/examples.json', 'utf8'))
const title = (name) => name === 'reading-rail' ? 'Rail TOC' : name.split('-').map(s => s[0].toUpperCase()+s.slice(1)).join(' ')
for (const item of registry.items) {
  const example = examples[item.name]
  if (!example) throw new Error(`Missing example for ${item.name}`)
  const file = item.files?.[0]?.path
  const rows = []
  if (file) {
    const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    const aliases = source.statements.filter(node => ts.isTypeAliasDeclaration(node) && /Props$/.test(node.name.text))
    const alias = aliases.find(node => node.name.text === item.name.split('-').map(s => s[0].toUpperCase()+s.slice(1)).join('')+'Props') ?? aliases[0]
    function visit(node) {
      if (ts.isPropertySignature(node) && node.name && node.type) {
        const name = node.name.getText(source).replaceAll('"', '')
        const type = node.type.getText(source).replace(/\s+/g, ' ')
        const comment = node.jsDoc?.map(doc => typeof doc.comment === 'string' ? doc.comment : '').join(' ') ?? ''
        rows.push([name+(node.questionToken ? '?' : ''), type, comment || `The ${name.replace(/([A-Z])/g, ' $1').toLowerCase()} option.`])
      } else ts.forEachChild(node, visit)
    }
    if (alias) visit(alias.type)
  }
  const escape = value => value.replaceAll('|', '\\|').replaceAll('\n', ' ')
  let api = rows.length ? '| Property | Type | Description |\n| --- | --- | --- |\n'+rows.map(row => `| \`${escape(row[0])}\` | \`${escape(row[1])}\` | ${escape(row[2])} |`).join('\n') : 'This entry supplies shared tokens or geometry rather than a standalone props interface. See the source for its complete exports.'
  if (item.name === 'rail-path') api = '`buildTrack(rows, radius?)` returns `{ d, at, total }`. `lengthAt(track, position)` maps a row position to a distance along the path. `useRailRows(ref, x, step, watch)` measures row centers for React components.'
  const dependencies = item.dependencies?.length ? item.dependencies.map(dep => `\`${dep}\``).join(', ') : 'No additional runtime packages beyond the project setup.'
  const content = `---\ntitle: ${JSON.stringify(title(item.name))}\ndescription: ${JSON.stringify(item.description)}\n---\n\n${example.notes}\n\n## Installation\n\n<InstallCommand name="${item.name}" />\n\n## Usage\n\n\`\`\`tsx\n${example.code.trim()}\n\`\`\`\n\n## API\n\n${api}\n\n${file ? 'Standard element attributes are supported where the props extend a React element type. Required properties appear without a question mark.\n\n' : ''}## Dependencies\n\n${dependencies}\n\nShared local files are included in the Code panel. See [project setup](/docs/installation) for Tailwind, path aliases, and theme tokens.\n${item.name === 'liquid-glass' ? '\n## Browser support\n\nChromium supports backdrop displacement. Other browsers use a frosted fallback. Keep content above the glass in a separate layer and avoid fading a parent of refracting glass.\n' : ''}`
  fs.writeFileSync(`content/docs/components/${item.name}.mdx`, content)
}
fs.writeFileSync('content/docs/components/meta.json', JSON.stringify({ title:'Components', pages:registry.items.map(item => item.name) },null,2)+'\n')
console.log(`Generated ${registry.items.length} component documents from working examples and source prop types.`)
