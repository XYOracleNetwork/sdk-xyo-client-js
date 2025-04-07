import type { BaseParams } from '@xylabs/base'
import type { EmptyObject, WithAdditional } from '@xylabs/object'
import type { AccountInstance } from '@xyo-network/account-model'

import type { AnyConfigSchema, ModuleConfig } from './Config/index.ts'
import type { ModuleInstance } from './instance/index.ts'
import type { ModuleIdentifierTransformer } from './ModuleIdentifierTransformer.ts'

export type ModuleParams<
  TConfig extends AnyConfigSchema<ModuleConfig> | void = void,
  TAdditionalParams extends EmptyObject | void = void,
> = WithAdditional<
  BaseParams<{
    account?: AccountInstance | 'random'
    addToResolvers?: boolean
    additionalSigners?: AccountInstance[]
    allowNameResolution?: boolean
    config: TConfig extends AnyConfigSchema<ModuleConfig> ? TConfig : AnyConfigSchema<ModuleConfig>
    ephemeralQueryAccountEnabled?: boolean
    moduleIdentifierTransformers?: ModuleIdentifierTransformer[]
    privateChildren?: ModuleInstance[]
    publicChildren?: ModuleInstance[]
  }>,
  TAdditionalParams
>
