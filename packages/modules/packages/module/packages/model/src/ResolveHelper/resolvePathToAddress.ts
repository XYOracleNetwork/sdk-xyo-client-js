import { Address } from '@xylabs/hex'

import { ModuleInstance } from '../instance/index.js'
import { ModuleIdentifierTransformer } from '../ModuleIdentifierTransformer.js'
import { ResolveHelperStatic } from './ResolveHelperStatic.js'
import { resolvePathToInstance } from './resolvePathToInstance.js'

export const resolvePathToAddress = async (
  root: ModuleInstance,
  path: string,
  includePrivate: boolean | undefined = undefined,
  transformers: ModuleIdentifierTransformer[] = ResolveHelperStatic.transformers,
): Promise<Address | undefined> => {
  return (await resolvePathToInstance(root, path, includePrivate, transformers))?.address
}
