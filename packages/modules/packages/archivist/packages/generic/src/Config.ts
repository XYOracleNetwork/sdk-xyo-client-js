import type { EmptyObject, WithAdditional } from '@xylabs/object'
import type { ArchivistConfig } from '@xyo-network/archivist-model'
import type { Payload, Schema } from '@xyo-network/payload-model'

export const GenericArchivistConfigSchema = 'network.xyo.archivist.generic.config' as const
export type GenericArchivistConfigSchema = typeof GenericArchivistConfigSchema

export type GenericArchivistConfig<TConfig extends Payload | EmptyObject | void = void, TSchema extends Schema | void = void> = ArchivistConfig<
  WithAdditional<
    {
      max?: number
    },
    TConfig
  >,
  TSchema extends Schema ? TSchema : GenericArchivistConfigSchema | ArchivistConfig['schema']
>
