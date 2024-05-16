import { Address } from '@xylabs/hex'

import { ModuleInstance } from '../instance'
import { ModuleIdentifierTransformer } from '../ModuleIdentifierTransformer'
import { ResolveHelper } from './ResolveHelper'
import { resolvePathToInstance } from './resolvePathToInstance'

export const resolvePathToAddress = async (
  root: ModuleInstance,
  path: string,
  includePrivate = false,
  transformers: ModuleIdentifierTransformer[] = ResolveHelper.transformers,
): Promise<Address | undefined> => {
  return (await resolvePathToInstance(root, path, includePrivate, transformers))?.address
}
