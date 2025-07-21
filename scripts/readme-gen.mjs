#!/usr/bin/env node

// generate-readmes.mjs
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { yarnWorkspaces } from '@xylabs/ts-scripts-yarn3'
import { generateTypeDoc } from './generate-typedoc.mjs'
// import { getPackageEntryPoints } from './get-package-entrypoints.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const templatePath = path.join(__dirname, 'README.template.md')

function fillTemplate(template, data) {
  const additionalData = { ...data, safeName: data.name.replaceAll('/', '__').replaceAll('@', '') }
  return template.replaceAll(/{{(.*?)}}/g, (_, key) => additionalData[key.trim()] ?? '')
}

async function tryLoadReadmeBody(location) {
  const readmeBodyPath = path.join(location, 'README_BODY.md')
  try {
    return await readFile(readmeBodyPath, 'utf8')
  } catch {
    return ''
  }
}

async function main() {
  const template = await readFile(templatePath, 'utf8')
  const pkgs = yarnWorkspaces()

  for (const { location } of pkgs) {
    try {
      const pkgJsonPath = path.join(location, 'package.json')
      const readmeBodyPath = path.join(location, 'README_BODY.md')
      const pkg = JSON.parse(await readFile(pkgJsonPath, 'utf8'))
      const body = await tryLoadReadmeBody(readmeBodyPath)
      const typedoc = await generateTypeDoc(location, ['src/index*.ts'])
      const readmeContent = fillTemplate(template, {
        ...pkg, body, typedoc,
      })
      await writeFile(path.join(location, 'README.md'), readmeContent)
      console.log(`✅ Created README.md for ${pkg.name}`)
    } catch (err) {
      console.warn(`⚠️ Skipped ${location}:`, err.message)
    }
  }
}

main().catch(console.error)
