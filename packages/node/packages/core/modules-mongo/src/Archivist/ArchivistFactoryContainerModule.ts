import { XyoAccount } from '@xyo-network/account'
import {
  ArchiveBoundWitnessArchivist,
  ArchiveModuleConfig,
  ArchiveModuleConfigSchema,
  ArchivePayloadsArchivist,
  ArchivePermissionsArchivist,
  SetArchivePermissionsPayload,
  XyoBoundWitnessWithMeta,
  XyoPayloadWithMeta,
} from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { ContainerModule, interfaces } from 'inversify'
import LruCache from 'lru-cache'

import { COLLECTIONS } from '../collections'
import { getBaseMongoSdk } from '../Mongo'
import { MONGO_TYPES } from '../types'
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
let payloadArchivistCache: LruCache<string, ArchivePayloadsArchivist> | undefined = undefined

type ArchivePermissionsArchivistFactory = interfaces.Factory<ArchivePermissionsArchivist>
type ArchiveBoundWitnessArchivistFactory = interfaces.Factory<ArchiveBoundWitnessArchivist>
type ArchivePayloadArchivistFactory = interfaces.Factory<ArchivePayloadsArchivist>

export const ArchivistFactoryContainerModule = new ContainerModule((bind: interfaces.Bind) => {
  archivePermissionsArchivistCache = new LruCache<string, ArchivePermissionsArchivist>({ max })
  boundWitnessArchivistCache = new LruCache<string, ArchiveBoundWitnessArchivist>({ max })
  payloadArchivistCache = new LruCache<string, ArchivePayloadsArchivist>({ max })
  bind<ArchiveBoundWitnessArchivistFactory>(TYPES.ArchiveBoundWitnessArchivistFactory).toFactory<ArchiveBoundWitnessArchivist, [string]>(
    (context) => {
      return (archive: string) => {
        const archivist = getBoundWitnessArchivist(context, archive)
        // TODO: Initialize or add to bus
        return archivist
      }
    },
  )
  bind<ArchivePayloadArchivistFactory>(TYPES.ArchivePayloadArchivistFactory).toFactory<ArchivePayloadsArchivist, [string]>((context) => {
    return (archive: string) => getPayloadArchivist(context, archive)
  })
  bind<ArchivePermissionsArchivistFactory>(TYPES.ArchivePermissionsArchivistFactory).toFactory<ArchivePermissionsArchivist, [string]>((context) => {
    return (archive: string) => getArchivePermissionsArchivist(context, archive)
  })
})

const getBoundWitnessArchivist = (context: interfaces.Context, archive: string) => {
  const cached = boundWitnessArchivistCache?.get?.(archive)
  if (cached) return cached
  const config: ArchiveModuleConfig = { archive, schema: ArchiveModuleConfigSchema }
  const account = context.container.get<XyoAccount>(TYPES.Account)
  const sdk = context.container.get<BaseMongoSdk<XyoBoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdkMongo)
  const archivist = new MongoDBArchiveBoundWitnessArchivist(account, sdk, config)
  boundWitnessArchivistCache?.set(archive, archivist)
  return archivist
}

const getPayloadArchivist = (context: interfaces.Context, archive: string) => {
  const cached = payloadArchivistCache?.get?.(archive)
  if (cached) return cached
  const config: ArchiveModuleConfig = { archive, schema: ArchiveModuleConfigSchema }
  const account = context.container.get<XyoAccount>(TYPES.Account)
  const sdk = getBaseMongoSdk<XyoPayloadWithMeta>(COLLECTIONS.Payloads)
  const archivist = new MongoDBArchivePayloadsArchivist(account, sdk, config)
  payloadArchivistCache?.set(archive, archivist)
  return archivist
}

const getArchivePermissionsArchivist = (context: interfaces.Context, archive: string) => {
  const cached = archivePermissionsArchivistCache?.get?.(archive)
  if (cached) return cached
  const config: ArchiveModuleConfig = { archive, schema: ArchiveModuleConfigSchema }
  const account = context.container.getNamed<XyoAccount>(TYPES.Account, 'root')
  const payloads = getBaseMongoSdk<XyoPayloadWithMeta<SetArchivePermissionsPayload>>(COLLECTIONS.Payloads)
  const bw = context.container.get<BaseMongoSdk<XyoBoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdkMongo)
  const archivist = new MongoDBArchivePermissionsPayloadPayloadArchivist(account, payloads, bw, config)
  archivePermissionsArchivistCache?.set(archive, archivist)
  return archivist
}
