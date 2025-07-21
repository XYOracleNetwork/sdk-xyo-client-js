import { execSync } from 'node:child_process'
import {
  existsSync, mkdirSync, readFileSync, readdirSync,
} from 'node:fs'
import { rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Generates inline TypeDoc markdown documentation
 * @param {string} packageLocation - The package location path
 * @param {string} sourceGlob - The glob pattern for source files
 * @returns {Promise<string>} A markdown string containing Reference
 */
export async function generateTypeDoc(packageLocation, entryPoints) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const tempDir = path.join(__dirname, '.temp-typedoc')

  console.log(`Generating TypeDoc for package at: ${packageLocation}`)
  for (const ep of entryPoints) {
    console.log(`  - Entry point: ${path.resolve(packageLocation, ep)}`)
  }

  try {
    // Create temp directory if it doesn't exist
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true })
    }

    // Create a minimal TypeDoc config for markdown generation
    const typedocConfig = {
      entryPoints: entryPoints.map(ep => path.resolve(packageLocation, ep)),
      entryPointStrategy: 'expand',
      out: tempDir,
      plugin: ['typedoc-plugin-markdown'],
      readme: 'none',
      theme: 'markdown',
      useCodeBlocks: true,
      hidePageTitle: true,
      githubPages: false,
      hideGenerator: true,
      hideBreadcrumbs: true,
      disableSources: true,
      skipErrorChecking: true,
      excludeExternals: true,
      excludeInternal: true,
      excludePrivate: true,
      sort: ['source-order'],
    }

    // Create temporary typedoc.json file
    const typedocJsonPath = path.join(tempDir, 'typedoc.json')
    await writeFile(typedocJsonPath, JSON.stringify(typedocConfig, null, 2))

    // Run TypeDoc with the config
    try {
      console.log(`Generating docs for: ${packageLocation}`)
      execSync(`npx typedoc --options ${typedocJsonPath}`, {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe'],
      })
    } catch (error) {
      console.error(`TypeDoc error: ${error.stderr ? error.stderr.toString() : error.message}`)
      return '## Reference\n\nReference generation failed.'
    }

    // Combine all markdown files into a single document
    return consolidateMarkdown(tempDir)
  } catch (error) {
    console.warn(`⚠️ Error generating TypeDoc for ${packageLocation}:`, error.message)
    return '## Reference\n\nReference generation failed.'
  } finally {
    // Clean up the temp directory
    try {
      await rm(tempDir, { recursive: true, force: true })
    } catch (error) {
      console.warn('⚠️ Failed to clean up temp directory:', error.message)
    }
  }
}

/**
 * Consolidates all markdown files in the TypeDoc output directory into a single markdown string
 * @param {string} tempDir - The temporary directory containing TypeDoc output
 * @returns {string} - Consolidated markdown content
 */
function consolidateMarkdown(tempDir) {
  // Start with the main README content
  let consolidated = '## Reference\n\n'

  // Read main README.md first (if it exists)
  const mainReadmePath = path.join(tempDir, 'README.md')
  if (existsSync(mainReadmePath)) {
    const mainContent = readFileSync(mainReadmePath, 'utf8')
      .replace(/^---(.|\n)*?---\n/, '') // Remove front matter
      .replace(/^# .+\n/, '') // Remove top-level header
      .replaceAll(/\]\((.+?)\.md\)/g, '](#$1)') // Fix internal links to use anchors

    consolidated += mainContent + '\n\n'
  }

  // Function to process a directory recursively
  function processDirectory(dir, level = 0) {
    const indent = '  '.repeat(level)
    let content = ''

    try {
      const items = readdirSync(dir, { withFileTypes: true })

      // Process files first
      for (const item of items) {
        const itemPath = path.join(dir, item.name)

        // Skip directories for now (process them later)
        if (item.isDirectory()) continue

        // Skip README.md (already processed) and files that aren't markdown
        if (item.name === 'README.md' || !item.name.endsWith('.md')) continue

        // Read file content
        const fileContent = readFileSync(itemPath, 'utf8')
          .replace(/^---(.|\n)*?---\n/, '') // Remove front matter

        // Get the module name from filename (without extension)
        const moduleName = item.name.replace('.md', '')

        // Create a header with anchor
        content += `\n\n${indent}### <a id="${moduleName}"></a>${moduleName}\n\n`

        // Add file content with fixed links
        content += fileContent
          .replace(/^# .+\n/, '') // Remove top-level header
          .replaceAll(/\]\((.+?)\.md\)/g, '](#$1)') // Fix internal links to use anchors
      }

      // Process subdirectories
      for (const item of items) {
        if (item.isDirectory()) {
          const subDirPath = path.join(dir, item.name)
          // Skip spec directories
          if (item.name === 'spec' || item.name.includes('.spec')) continue

          // Create a header for the directory
          content += `\n\n${indent}### ${item.name}\n`

          // Process the subdirectory
          content += processDirectory(subDirPath, level + 1)
        }
      }
    } catch (error) {
      console.warn(`⚠️ Error processing directory ${dir}:`, error.message)
    }

    return content
  }

  // Process all files in the tempDir
  consolidated += processDirectory(tempDir)

  // Clean up the markdown (fix duplicate headers, etc.)
  consolidated = consolidated
    .replaceAll(/\n\n\n+/g, '\n\n') // Remove excess newlines
    .replaceAll(/^#### /gm, '### ') // Adjust heading levels
    .replaceAll(/^##### /gm, '#### ') // Adjust heading levels
    .replaceAll(/^###### /gm, '##### ') // Adjust heading levels

  return consolidated
}
