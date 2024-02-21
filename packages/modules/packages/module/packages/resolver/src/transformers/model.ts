import { Promisable } from '@xylabs/promise'
import { ModuleIdentifier } from '@xyo-network/module-model'

export type ModuleIdentifierTransformerFunc = (id: ModuleIdentifier) => Promisable<ModuleIdentifier>

export interface ModuleIdentifierTransformer {
  transform: ModuleIdentifierTransformerFunc
}
