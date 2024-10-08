import { assertEx } from '@xylabs/assert'
import { asAddress } from '@xylabs/hex'

import type { ModuleInstance } from '../instance/index.ts'
import { MODULE_PATH_SEPARATOR } from '../ModuleIdentifier.ts'
import type { ModuleIdentifierTransformer } from '../ModuleIdentifierTransformer.ts'
import { resolveAddressToInstance } from './resolveAddressToInstance.ts'
import { ResolveHelperStatic } from './ResolveHelperStatic.ts'
import { resolveLocalNameToAddress } from './resolveLocalNameToAddress.ts'
import { transformModuleIdentifier } from './transformModuleIdentifier.ts'

export const resolvePathToInstance = async (
  root: ModuleInstance,
  path: string,
  includePrivate: boolean | undefined = undefined,
  transformers: ModuleIdentifierTransformer[] = ResolveHelperStatic.transformers,
): Promise<ModuleInstance | undefined> => {
  const parts = path.split(MODULE_PATH_SEPARATOR)
  const first = await transformModuleIdentifier(
    assertEx(parts.shift(), () => `First part is invalid [${path}]`),
    transformers,
  )

  if (!first) {
    return undefined
  }

  const firstAddress = asAddress(first) ?? (await resolveLocalNameToAddress(root, first, includePrivate))

  if (firstAddress) {
    const firstModule = await resolveAddressToInstance(root, firstAddress, includePrivate)
    if (firstModule && parts.length > 0) {
      return resolvePathToInstance(firstModule, parts.join(MODULE_PATH_SEPARATOR))
    }
    return firstModule
  }
}
