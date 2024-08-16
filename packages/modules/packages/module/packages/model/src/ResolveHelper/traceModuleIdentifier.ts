import { assertEx } from '@xylabs/assert'
import type { Address } from '@xylabs/hex'

import type { ModuleResolver } from '../instance/index.ts'
import { asModuleInstance } from '../instance/index.ts'
import type { ModuleIdentifier } from '../ModuleIdentifier.ts'

export const traceModuleIdentifier = async (resolver: ModuleResolver, path: ModuleIdentifier): Promise<Address[]> => {
  const parts = path.split(':')
  const first = parts.shift()
  const firstModule = asModuleInstance(
    assertEx(await resolver.resolve(first, { maxDepth: 1 }), () => `Failed to resolve [${first}]`),
    () => `Resolved invalid module instance [${first}]`,
  )
  if (firstModule) {
    return parts.length > 0 ? [firstModule.address, ...(await traceModuleIdentifier(firstModule, parts.join(':')))] : [firstModule.address]
  }
  return []
}
