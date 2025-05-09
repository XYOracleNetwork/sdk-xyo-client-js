import type { EmptyObject, WithAdditional } from '@xylabs/object'
import type { ArchivistConfig } from '@xyo-network/archivist-model'
import type { Payload, Schema } from '@xyo-network/payload-model'

export const MemoryArchivistConfigSchema = 'network.xyo.archivist.memory.config' as const
export type MemoryArchivistConfigSchema = typeof MemoryArchivistConfigSchema

export type MemoryArchivistConfig<TConfig extends Payload | EmptyObject | void = void, TSchema extends Schema | void = void> = ArchivistConfig<
  WithAdditional<
    {
      max?: number
    },
    TConfig
  >,
  TSchema extends Schema ? TSchema : MemoryArchivistConfigSchema | ArchivistConfig['schema']
>
