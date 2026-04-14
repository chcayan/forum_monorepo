import fs from 'fs'
import path from 'path'

const root = path.resolve('dist')

function fixFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8')

  const replaced = content.replace(
    /((?:import|export)\s+(?:[^'"]*\s+from\s+)?['"])(\.{1,2}\/[^'"]+?)(?<!\.js)(['"])/g,
    (_, start, pathPart, end) => `${start}${pathPart}.js${end}`
  )

  if (content !== replaced) {
    fs.writeFileSync(filePath, replaced, 'utf-8')
  }
}

function walk(dir: string) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file)
    if (fs.statSync(full).isDirectory()) walk(full)
    else if (file.endsWith('.js')) fixFile(full)
  }
}

walk(root)
console.log('\n已为 import/export 自动补上 .js 扩展')
