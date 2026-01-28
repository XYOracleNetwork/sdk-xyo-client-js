import type { EmptyObject, WithAdditional } from '@xylabs/sdk-js'
import type { ArchivistConfig } from '@xyo-network/archivist-model'
import {
  asSchema, type Payload, type Schema,
} from '@xyo-network/payload-model'

export const GenericArchivistConfigSchema = asSchema('network.xyo.archivist.generic.config', true)
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
