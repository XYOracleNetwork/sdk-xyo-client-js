import type { EmptyObject, WithAdditional } from '@xylabs/object'
import type { Payload, Schema } from '@xyo-network/payload-model'

import type { ArchivingModuleConfig } from './Archiving.ts'
import type { ModuleConfigFields } from './Fields.ts'
import type { ArchivingReentrancyConfig } from './Reentrancy.ts'

export const ModuleConfigSchema = 'network.xyo.module.config' as const
export type ModuleConfigSchema = typeof ModuleConfigSchema

export type ModuleConfig<TConfig extends EmptyObject | Payload | void = void, TSchema extends Schema | void = void> = Payload<
  WithAdditional<ArchivingModuleConfig & ModuleConfigFields & ArchivingReentrancyConfig, TConfig>,
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
