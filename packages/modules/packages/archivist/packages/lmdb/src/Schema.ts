import { asSchema } from '@xyo-network/payload-model'

export const LmdbArchivistSchema = asSchema('network.xyo.archivist.lmdb', true)
export type LmdbArchivistSchema = typeof LmdbArchivistSchema
