import {
  BaseParams, EmptyObject, WithAdditional,
} from '@xylabs/object'
import { AccountInstance } from '@xyo-network/account-model'

import { AnyConfigSchema, ModuleConfig } from './Config/index.ts'
import { ModuleInstance } from './instance/index.ts'
import { ModuleIdentifierTransformer } from './ModuleIdentifierTransformer.ts'

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
