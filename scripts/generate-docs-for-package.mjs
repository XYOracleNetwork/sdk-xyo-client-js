/* eslint-disable max-statements */
import { execSync } from 'node:child_process'
import fs, { rmSync } from 'node:fs'
import path from 'node:path'

export function generateDocsForPackage(pkgName, pkgDir) {
  if (!pkgName) {
    console.error('❌ Please provide a package name as an argument.')
    return 1
  }

  const safePkgDir = pkgName.replaceAll('/', '__')
  const packageRoot = path.join(process.cwd(), pkgDir)
  const pkgJsonPath = path.join(packageRoot, 'package.json')

  if (!fs.existsSync(pkgJsonPath)) {
    console.error(`❌ Could not find package: ${pkgName}`)
    return 1
  }

  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'))
  const entryRelative = pkg.types || pkg.typings || pkg.main

  if (!entryRelative) {
    console.error(`❌ Package "${pkgName}" does not specify "types", "typings", or "main".`)
    return 1
  }

  const entryAbsolute = path.join(packageRoot, entryRelative)
  if (!fs.existsSync(entryAbsolute)) {
    console.error(`❌ Entry point not found: ${entryAbsolute}`)
    return 1
  }

  const originalTsconfigPath = path.join(packageRoot, 'tsconfig.json')
  let compilerOptions = {
    target: 'ES2020',
    module: 'ESNext',
    strict: true,
    moduleResolution: 'Node',
    skipLibCheck: true,
  }

  if (fs.existsSync(originalTsconfigPath)) {
    const originalTsconfig = JSON.parse(fs.readFileSync(originalTsconfigPath, 'utf8'))
    if (originalTsconfig.compilerOptions) {
      compilerOptions = { ...compilerOptions, ...originalTsconfig.compilerOptions }
    }
  }

  const tempTsconfigPath = path.join(packageRoot, `.typedoc-pkg-${safePkgDir}.tsconfig.json`)
  fs.writeFileSync(tempTsconfigPath, JSON.stringify({
    compilerOptions,
    include: [entryAbsolute],
  }, null, 2))

  console.log(`📘 Generating docs for "${pkgName}" from ${entryRelative}...`)

  try {
    execSync(
      `npx typedoc --entryPoints ${entryAbsolute} --tsconfig ${tempTsconfigPath} --out ${packageRoot}/docs --plugin typedoc-plugin-markdown --readme none --hidePageHeader --excludePrivate --excludeProtected`,
      { stdio: 'inherit' },
    )
    rmSync(tempTsconfigPath, { force: true })
    console.log(`✅ Docs generated for [${pkgName}]`)
    return 0
  } catch (err) {
    console.error('❌ Failed to generate documentation:', err.message, err.stack)
    return 1
  }
}
