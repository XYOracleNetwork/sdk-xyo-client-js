import type { EmptyObject } from '@xylabs/sdk-js'
import type { Payload, Schema } from '@xyo-network/payload-model'

import type { ArchivingModuleConfig } from './Archiving.ts'
import type { ModuleConfigFields } from './Fields.ts'
import type { ArchivingReentrancyConfig } from './Reentrancy.ts'

export const ModuleConfigSchema = 'network.xyo.module.config' as const
export type ModuleConfigSchema = typeof ModuleConfigSchema

export type WithAdditional<T extends EmptyObject = EmptyObject, TAdditional extends EmptyObject = EmptyObject>
  = T & TAdditional

export type ModuleConfig<TConfig extends EmptyObject | Payload = EmptyObject, TSchema extends Schema | void = void> = Payload<
  WithAdditional<ArchivingModuleConfig & ModuleConfigFields & ArchivingReentrancyConfig, TConfig>,
  TSchema extends void ? TConfig extends Payload ? TConfig['schema']
    : Schema : TSchema
>

export type AnyConfigSchema<TConfig extends Omit<ModuleConfig, 'schema'> & { schema: Schema } = Omit<ModuleConfig, 'schema'> & { schema: Schema }>
  = ModuleConfig<TConfig, string>

export type OptionalConfigSchema<TConfig extends AnyConfigSchema<ModuleConfig> = AnyConfigSchema<ModuleConfig>> = Omit<TConfig, 'schema'> & {
  schema?: TConfig['schema']
}

export type AnyModuleConfig = AnyConfigSchema<ModuleConfig>
