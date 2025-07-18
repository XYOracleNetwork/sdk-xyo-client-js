#!/usr/bin/env node

// generate-readmes.mjs
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { yarnWorkspaces } from '@xylabs/ts-scripts-yarn3'
// import { generateDocsForPackage } from './generate-docs-for-package.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const templatePath = path.join(__dirname, 'README.template.md')

function fillTemplate(template, data) {
  const additionalData = { ...data, safeName: data.name.replaceAll('/', '__').replaceAll('@', '') }
  return template.replaceAll(/{{(.*?)}}/g, (_, key) => additionalData[key.trim()] ?? '')
}

async function main() {
  const template = await readFile(templatePath, 'utf8')
  const pkgs = yarnWorkspaces()

  for (const { location } of pkgs) {
    const pkgJsonPath = path.join(location, 'package.json')
    try {
      const pkg = JSON.parse(await readFile(pkgJsonPath, 'utf8'))
      const readmeContent = fillTemplate(template, pkg)
      await writeFile(path.join(location, 'README.md'), readmeContent)
      // generateDocsForPackage(pkg.name, location)
      console.log(`✅ Created README.md for ${pkg.name}`)
    } catch (err) {
      console.warn(`⚠️ Skipped ${location}:`, err.message)
    }
  }
}

main().catch(console.error)
