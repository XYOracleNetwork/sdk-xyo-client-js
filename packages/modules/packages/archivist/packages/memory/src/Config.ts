import type { EmptyObject, WithAdditional } from '@xylabs/sdk-js'
import type { ArchivistConfig } from '@xyo-network/archivist-model'
import {
  asSchema, type Payload, type Schema,
} from '@xyo-network/payload-model'

export const MemoryArchivistConfigSchema = asSchema('network.xyo.archivist.memory.config', true)
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
