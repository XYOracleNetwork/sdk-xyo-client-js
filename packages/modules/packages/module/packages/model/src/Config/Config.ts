import { EmptyObject, WithAdditional } from '@xylabs/object'
import { Payload, Schema } from '@xyo-network/payload-model'

import { ArchivingModuleConfig } from './Archiving.js'
import { ModuleConfigFields } from './Fields.js'

export type ModuleConfigSchema = 'network.xyo.module.config'
export const ModuleConfigSchema: ModuleConfigSchema = 'network.xyo.module.config'

export type ModuleConfig<TConfig extends EmptyObject | Payload | void = void, TSchema extends Schema | void = void> = Payload<
  WithAdditional<ArchivingModuleConfig & ModuleConfigFields, TConfig>,
  TSchema extends Schema ? TSchema
  : TConfig extends Payload ? TConfig['schema']
  : ModuleConfigSchema
>

export type AnyConfigSchema<TConfig extends Omit<ModuleConfig, 'schema'> & { schema: string } = Omit<ModuleConfig, 'schema'> & { schema: string }> =
  ModuleConfig<TConfig, string>

export type OptionalConfigSchema<TConfig extends AnyConfigSchema<ModuleConfig> = AnyConfigSchema<ModuleConfig>> = Omit<TConfig, 'schema'> & {
  schema?: TConfig['schema']
}

export type AnyModuleConfig = AnyConfigSchema<ModuleConfig>
