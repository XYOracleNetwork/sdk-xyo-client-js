import type { Address } from '@xylabs/hex'

import type { ModuleInstance } from '../instance/index.ts'
import type { ModuleIdentifierTransformer } from '../ModuleIdentifierTransformer.ts'
import { ResolveHelperStatic } from './ResolveHelperStatic.ts'
import { resolvePathToInstance } from './resolvePathToInstance.ts'

export const resolvePathToAddress = async (
  root: ModuleInstance,
  path: string,
  includePrivate: boolean | undefined = undefined,
  transformers: ModuleIdentifierTransformer[] = ResolveHelperStatic.transformers,
): Promise<Address | undefined> => {
  return (await resolvePathToInstance(root, path, includePrivate, transformers))?.address
}
