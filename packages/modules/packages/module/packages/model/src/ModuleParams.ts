import type { CreatableParams } from '@xylabs/creatable'
import type { AccountInstance } from '@xyo-network/account-model'

import type { AnyConfigSchema, ModuleConfig } from './Config/index.ts'
import type { ModuleInstance } from './instance/index.ts'
import type { ModuleIdentifierTransformer } from './ModuleIdentifierTransformer.ts'
import type { ModuleStatusReporter } from './ModuleStatusReporter.ts'

export type ModuleChildrenParams = {
  privateChildren?: ModuleInstance[]
  publicChildren?: ModuleInstance[]
}

export interface ModuleParams<TConfig extends AnyConfigSchema<ModuleConfig> = AnyConfigSchema<ModuleConfig>> extends CreatableParams, ModuleChildrenParams {
  account?: AccountInstance | 'random'
  addToResolvers?: boolean
  additionalSigners?: AccountInstance[]
  allowNameResolution?: boolean
  config: Partial<TConfig>
  ephemeralQueryAccountEnabled?: boolean
  moduleIdentifierTransformers?: ModuleIdentifierTransformer[]
  statusReporter?: ModuleStatusReporter
}
