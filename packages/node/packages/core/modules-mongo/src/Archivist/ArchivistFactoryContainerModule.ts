import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import {
  ArchiveBoundWitnessArchivist,
  ArchiveBoundWitnessArchivistFactory,
  ArchiveModuleConfig,
  ArchiveModuleConfigSchema,
  ArchivePayloadArchivist,
  ArchivePayloadArchivistFactory,
  ArchivePermissionsArchivist,
  ArchivePermissionsArchivistFactory,
  SetArchivePermissionsPayload,
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
import { MongoDBArchivePayloadsArchivist } from './ArchivePayloads'
import { MongoDBArchivePermissionsPayloadPayloadArchivist } from './ArchivePermissions'

/**
 * The number of most recently used archive archivists to keep
 * in the cache
 */
const max = 1000

let archivePermissionsArchivistCache: LruCache<string, ArchivePermissionsArchivist> | undefined = undefined
let boundWitnessArchivistCache: LruCache<string, ArchiveBoundWitnessArchivist> | undefined = undefined
let payloadArchivistCache: LruCache<string, ArchivePayloadArchivist> | undefined = undefined

export const ArchivistFactoryContainerModule = new ContainerModule((bind: interfaces.Bind) => {
  archivePermissionsArchivistCache = new LruCache<string, ArchivePermissionsArchivist>({ max })
  boundWitnessArchivistCache = new LruCache<string, ArchiveBoundWitnessArchivist>({ max })
  payloadArchivistCache = new LruCache<string, ArchivePayloadArchivist>({ max })
  bind<ArchiveBoundWitnessArchivistFactory>(TYPES.ArchiveBoundWitnessArchivistFactory).toFactory<Promise<ArchiveBoundWitnessArchivist>, [string]>(
    (context) => {
      return (archive: string) => getBoundWitnessArchivist(context, archive)
    },
  )
  bind<ArchivePayloadArchivistFactory>(TYPES.ArchivePayloadArchivistFactory).toFactory<Promise<ArchivePayloadArchivist>, [string]>((context) => {
    return (archive: string) => getPayloadArchivist(context, archive)
  })
  bind<ArchivePermissionsArchivistFactory>(TYPES.ArchivePermissionsArchivistFactory).toFactory<ArchivePermissionsArchivist, [string]>((context) => {
    return (archive: string) => getArchivePermissionsArchivist(context, archive)
  })
})

const getBoundWitnessArchivist = async (context: interfaces.Context, archive: string) => {
  const cached = boundWitnessArchivistCache?.get?.(archive)
  if (cached) return cached
  const config: ArchiveModuleConfig = { archive, schema: ArchiveModuleConfigSchema }
  const account = new Account()
  const sdk = getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses)
  const logger = context.container.get<Logger>(TYPES.Logger)
  const params = { account, config, logger, sdk }
  const archivist = await MongoDBArchiveBoundWitnessArchivist.create(params)
  boundWitnessArchivistCache?.set(archive, archivist)
  return archivist
}

const getPayloadArchivist = async (context: interfaces.Context, archive: string) => {
  const cached = payloadArchivistCache?.get?.(archive)
  if (cached) return cached
  const config: ArchiveModuleConfig = { archive, schema: ArchiveModuleConfigSchema }
  const account = new Account()
  const sdk = getBaseMongoSdk<XyoPayloadWithMeta>(COLLECTIONS.Payloads)
  const logger = context.container.get<Logger>(TYPES.Logger)
  const params = { account, config, logger, sdk }
  const archivist = await MongoDBArchivePayloadsArchivist.create(params)
  payloadArchivistCache?.set(archive, archivist)
  return archivist
}

const getArchivePermissionsArchivist = (context: interfaces.Context, archive: string) => {
  const cached = archivePermissionsArchivistCache?.get?.(archive)
  if (cached) return cached
  const config: ArchiveModuleConfig = { archive, schema: ArchiveModuleConfigSchema }
  const phrase = assertEx(process.env.ACCOUNT_SEED)
  const account = new Account({ phrase })
  const payloads = getBaseMongoSdk<XyoPayloadWithMeta<SetArchivePermissionsPayload>>(COLLECTIONS.Payloads)
  const bw = getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses)
  const archivist = new MongoDBArchivePermissionsPayloadPayloadArchivist(account, payloads, bw, config)
  archivePermissionsArchivistCache?.set(archive, archivist)
  return archivist
}
