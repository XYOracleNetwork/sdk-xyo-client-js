import { spawnSync } from 'node:child_process'

export const yarnWorkspaces = () => {
  const result = spawnSync('yarn', ['workspaces', 'list', '--json', '--recursive'], { encoding: 'utf8', shell: true })
  if (result.error) {
    throw result.error
  }
  return (
    result.stdout
      .toString()
      // NOTE: This probably doesn't work on Windows
      // TODO: Replace /r/n with /n first
      .split('\n')
      .slice(0, -1)
      .map((item) => {
        return JSON.parse(item)
      })
  )
}

const workspaceList = yarnWorkspaces()
const workspaceLocations = workspaceList.map(({ location }) => location)
const exclude = workspaceLocations.flatMap((location) => {
  return [`${location}/dist/**/*`, `${location}/docs/**/*`, `${location}/**/*spec.*`, `${location}/**/*.d.ts`]
})

const config = {
  entryPointStrategy: 'packages',
  entryPoints: workspaceLocations,
  out: 'docs',
  plugin: ['typedoc-plugin-markdown'],
  exclude,
  excludeExternals: true,
  excludePrivate: true,
  excludeProtected: true,
  includeVersion: true,
}

export default config
