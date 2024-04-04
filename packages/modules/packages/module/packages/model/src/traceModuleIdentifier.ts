import { assertEx } from '@xylabs/assert'
import { Address } from '@xylabs/hex'

import { asModuleInstance, ModuleResolver } from './instance'
import { ModuleIdentifier } from './ModuleIdentifier'

//translates a complex module path to addresses
export const traceModuleIdentifier = async (resolver: ModuleResolver, path: ModuleIdentifier): Promise<Address[]> => {
  const parts = path.split(':')
  const first = parts.shift()
  const firstModule = asModuleInstance(
    assertEx(await resolver.resolve(first), () => `Failed to resolve [${first}]`),
    () => `Resolved invalid module instance [${first}]`,
  )
  if (parts.length > 0) {
    return [firstModule.address, ...(await traceModuleIdentifier(firstModule, parts.join(':')))]
  }
  return [firstModule.address]
}