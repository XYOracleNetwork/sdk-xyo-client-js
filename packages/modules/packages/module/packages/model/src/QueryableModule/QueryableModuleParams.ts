import type { CreatableParams } from '@xylabs/sdk-js'
import type { AccountInstance } from '@xyo-network/account-model'

import type { AnyConfigSchema, ModuleConfig } from '../Config/index.ts'
import type { ModuleIdentifierTransformer } from '../ModuleIdentifierTransformer.ts'
import type { ModuleStatusReporter } from '../ModuleStatusReporter.ts'

export interface QueryableModuleParams<TConfig extends AnyConfigSchema<ModuleConfig> = AnyConfigSchema<ModuleConfig>> extends CreatableParams {
  account?: AccountInstance | 'random'
  addToResolvers?: boolean
  additionalSigners?: AccountInstance[]
  allowNameResolution?: boolean
  config: Partial<TConfig>
  ephemeralQueryAccountEnabled?: boolean
  moduleIdentifierTransformers?: ModuleIdentifierTransformer[]
  statusReporter?: ModuleStatusReporter
}

/** @deprecated use QueryableModuleParams instead */
export interface ModuleParams<TConfig extends AnyConfigSchema<ModuleConfig> = AnyConfigSchema<ModuleConfig>> extends QueryableModuleParams<TConfig> {}
