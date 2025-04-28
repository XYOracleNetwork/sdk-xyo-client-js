#!/usr/bin/env node

import ts from 'typescript'
import path from 'node:path'
import fs from 'node:fs'
import { globSync } from 'glob'
import { yarnWorkspaces } from '@xylabs/ts-scripts-yarn3'
import chalk from 'chalk'

function getDependenciesFromPackageJson(packageJsonPath) {
  const packageJsonFullPath = path.resolve(packageJsonPath)
  const rawContent = fs.readFileSync(packageJsonFullPath, 'utf8')
  const packageJson = JSON.parse(rawContent)

  const dependencies = packageJson.dependencies
    ? Object.keys(packageJson.dependencies)
    : []

  const devDependencies = packageJson.devDependencies
    ? Object.keys(packageJson.devDependencies)
    : []

  return { dependencies, devDependencies }
}

function getBasePackageName(importName) {
  if (importName.startsWith('@')) {
    const parts = importName.split('/')
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : importName
  }
  return importName.split('/')[0]
}

function getImportsFromFile(filePath, importPaths) {
  const sourceCode = fs.readFileSync(filePath, 'utf8')

  const sourceFile = ts.createSourceFile(
    path.basename(filePath),
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
  )

  const imports = []

  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      const moduleSpecifier = (node.moduleSpecifier)?.text
      if (moduleSpecifier) {
        imports.push(moduleSpecifier)
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  const cleanedImports = imports.filter(imp => !imp.startsWith('.') && !imp.startsWith('#') && !imp.startsWith('node:')).map(getBasePackageName)

  for (const imp of cleanedImports) {
    importPaths[imp] = importPaths[imp] || []
    importPaths[imp].push(filePath)
  }

  return cleanedImports
}

function findFilesByGlob(cwd, pattern) {
  return globSync(pattern, { cwd, absolute: true })
}

function run({
  name, location, devDeps = false,
}) {
  const allFiles = findFilesByGlob(location, './src/**/*.{ts,tsx}')
  const prodFiles = allFiles.filter(file => !file.endsWith('.spec.ts') && !file.endsWith('.stories.tsx') && !file.includes('/spec/'))
  const devFiles = allFiles.filter(file => file.endsWith('.spec.ts') || file.endsWith('.stories.tsx') || file.includes('/spec/'))
  // console.log('Production files:', prodFiles)
  // console.log('Development files:', devFiles)
  const prodImportPaths = {}
  const prodImports = prodFiles.flatMap(path => getImportsFromFile(path, prodImportPaths))
  const devImportPaths = {}
  const devImports = devFiles.flatMap(path => getImportsFromFile(path, devImportPaths))
  const externalProdImports = prodImports.filter(imp => !imp.startsWith('.') && !imp.startsWith('#') && !imp.startsWith('node:'))
  const externalDevImports = devImports.filter(imp => !imp.startsWith('.') && !imp.startsWith('#') && !imp.startsWith('node:'))

  // console.log('externalProdImports:', externalProdImports)
  // console.log('externalDevImports:', externalDevImports)

  const deps = getDependenciesFromPackageJson(`${location}/package.json`)
  // console.log('Project.Dependencies:', deps.dependencies)
  // console.log('Project.DevDependencies:', deps.devDependencies)

  for (const imp of externalProdImports) {
    if (!deps.dependencies.includes(imp)) {
      console.log(`[${chalk.blue(name)}] Missing dependency in package.json: ${chalk.red(imp)}`)
      console.log(`  ${prodImportPaths[imp].join('\n')}`)
      console.log('')
    }
  }

  if (devDeps) {
    for (const imp of externalDevImports) {
      if (!deps.devDependencies.includes(imp)) {
        console.log(`[${chalk.blue(name)}] Missing devDependency in package.json: ${chalk.red(imp)}`)
        console.log(`  Found in: ${devImportPaths[imp].join(', ')}`)
      }
    }
  }
}

const workspaces = yarnWorkspaces()

for (const workspace of workspaces) {
  run(workspace)
}
