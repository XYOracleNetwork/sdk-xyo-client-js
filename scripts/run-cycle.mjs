#!/usr/bin/env node

import { cruise } from 'dependency-cruiser'
import { spawnSync } from 'node:child_process'

export const yarnWorkspaces = () => {
  const result = spawnSync('yarn', ['workspaces', 'list', '--json', '--recursive'], { encoding: 'utf8', shell: true })
  if (result.error) {
    throw result.error
  }
  return (
    result.stdout
      .toString()
      // This probably doesn't work on Windows
      // TODO: Replace /r/n with /n first
      .split('\n')
      .slice(0, -1)
      .map((item) => {
        return JSON.parse(item)
      })
  )
}

export const cycleAll = async () => {
  const pkgName = process.env.npm_package_name

  const cruiseOptions = {
    ruleSet: {
      forbidden: [
        {
          name: 'no-circular',
          severity: 'error',
          comment: 'This dependency creates a circular reference',
          from: {},
          to: { circular: true },
        },
      ],
    },
    exclude: 'node_modules|packages/.*/packages',
    validate: true,
    doNotFollow: { path: 'node_modules|packages/.*/packages' },
    tsPreCompilationDeps: false,
    combinedDependencies: true,
    outputType: 'err',
  }

  const packages = yarnWorkspaces()
  const targets = packages.map(({ location }) => `${location}/src/**`)

  console.log('Checking for circular dependencies in packages...')

  const result = await cruise(targets, cruiseOptions)
  console.log(result.output)

  if (result.exitCode === 0) {
    console.log(`${pkgName} ✅ No dependency violations`)
  } else {
    console.error(`${pkgName} ❌ Dependency violations found`)
  }
  return result.exitCode
}

cycleAll().then(() => {
  console.log('Exiting with code 0')
  process.exit(0)
}).catch((error) => {
  console.error('Error while checking for circular dependencies:', error)
  process.exit(1)
})
