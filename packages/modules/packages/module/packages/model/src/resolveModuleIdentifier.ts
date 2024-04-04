import { assertEx } from '@xylabs/assert'

import { asModuleInstance, ModuleInstance, ModuleResolver } from './instance'
import { ModuleIdentifier } from './ModuleIdentifier'

//resolves a complex module path to addresses
export const resolveModuleIdentifier = async (resolver: ModuleResolver, path: ModuleIdentifier): Promise<ModuleInstance | undefined> => {
  const parts = path.split(':')
  const first = parts.shift()
  const firstModule = asModuleInstance(
    assertEx(await resolver.resolve(first, { maxDepth: 1 }), () => `Failed to resolve [${first}]`),
    () => `Resolved invalid module instance [${first}]`,
  )
  if (firstModule) {
    return parts.length > 0 ? await resolveModuleIdentifier(firstModule, parts.join(':')) : firstModule
  }
}
