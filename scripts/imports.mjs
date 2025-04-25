#!/usr/bin/env node

import ts from 'typescript'
import path from 'node:path'
import fs from 'node:fs'

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

function getImportsFromFile(filePath) {
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

  return imports
}

function run() {
  const imports = getImportsFromFile('./src/index.ts')
  const externalImports = imports.filter(imp => !imp.startsWith('.') && !imp.startsWith('#'))
  console.log(externalImports)

  const deps = getDependenciesFromPackageJson('./package.json')
  console.log('Dependencies:', deps.dependencies)
  console.log('DevDependencies:', deps.devDependencies)
}

run()
