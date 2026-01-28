import { asSchema } from '@xyo-network/payload-model'

export const LevelDbArchivistSchema = asSchema('network.xyo.archivist.leveldb', true)
export type LevelDbArchivistSchema = typeof LevelDbArchivistSchema
