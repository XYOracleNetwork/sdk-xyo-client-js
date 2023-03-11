import { ArchivistModule, MemoryNode } from '@xyo-network/modules'
import { getBoundWitnessArchivistName, getPayloadArchivistName } from '@xyo-network/node-core-lib'
import {
  ArchiveBoundWitnessArchivist,
  ArchiveBoundWitnessArchivistFactory,
  ArchiveModuleConfig,
  ArchiveModuleConfigSchema,
  ArchivePayloadArchivistFactory,
  XyoBoundWitnessWithMeta,
  XyoPayloadWithMeta,
} from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { Logger } from '@xyo-network/shared'
import { ContainerModule, interfaces } from 'inversify'
import LruCache from 'lru-cache'

import { COLLECTIONS } from '../collections'
import { getBaseMongoSdk } from '../Mongo'
import { MongoDBArchiveBoundWitnessArchivist } from './ArchiveBoundWitness'
import { MongoDBArchivePayloadArchivist } from './ArchivePayloads'

/**
 * The number of most recently used archive archivists to keep
 * in the cache
 */
const max = 1000

const schema = ArchiveModuleConfigSchema

let boundWitnessArchivistCache: LruCache<string, ArchiveBoundWitnessArchivist> | undefined = undefined
let payloadArchivistCache: LruCache<string, ArchivistModule> | undefined = undefined

export const ArchivistFactoryContainerModule = new ContainerModule((bind: interfaces.Bind) => {
  boundWitnessArchivistCache = new LruCache<string, ArchiveBoundWitnessArchivist>({ max })
  payloadArchivistCache = new LruCache<string, ArchivistModule>({ max })
  bind<ArchiveBoundWitnessArchivistFactory>(TYPES.ArchiveBoundWitnessArchivistFactory).toFactory<Promise<ArchiveBoundWitnessArchivist>, [string]>(
    (context) => {
      return (archive: string) => getBoundWitnessArchivist(context, archive)
    },
  )
  bind<ArchivePayloadArchivistFactory>(TYPES.ArchivePayloadArchivistFactory).toFactory<Promise<ArchivistModule>, [string]>((context) => {
    return (archive: string) => getPayloadArchivist(context, archive)
  })
})

const getBoundWitnessArchivist = async (context: interfaces.Context, archive: string) => {
  const cached = boundWitnessArchivistCache?.get?.(archive)
  if (cached) return cached
  const config: ArchiveModuleConfig = { archive, name: getBoundWitnessArchivistName(archive), schema }
  const sdk = getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses)
  const logger = context.container.get<Logger>(TYPES.Logger)
  const params = { config, logger, sdk }
  const archivist = await MongoDBArchiveBoundWitnessArchivist.create(params)
  const node = context.container.get<MemoryNode>(TYPES.Node)
  await node.register(archivist).attach(archivist.address, true)
  boundWitnessArchivistCache?.set(archive, archivist)
  return archivist
}

const getPayloadArchivist = async (context: interfaces.Context, archive: string) => {
  const cached = payloadArchivistCache?.get?.(archive)
  if (cached) return cached
  const config: ArchiveModuleConfig = { archive, name: getPayloadArchivistName(archive), schema }
  const sdk = getBaseMongoSdk<XyoPayloadWithMeta>(COLLECTIONS.Payloads)
  const logger = context.container.get<Logger>(TYPES.Logger)
  const params = { config, logger, sdk }
  const archivist = await MongoDBArchivePayloadArchivist.create(params)
  const node = context.container.get<MemoryNode>(TYPES.Node)
  await node.register(archivist).attach(archivist.address, true)
  payloadArchivistCache?.set(archive, archivist)
  return archivist
}
