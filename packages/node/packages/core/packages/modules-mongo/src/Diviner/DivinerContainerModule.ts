/* eslint-disable max-statements */
import { AddressHistoryDiviner, AddressSpaceDiviner, XyoArchivistPayloadDivinerConfigSchema, XyoDivinerConfigSchema } from '@xyo-network/diviner'
import { Module } from '@xyo-network/module-model'
import {
  BoundWitnessDiviner,
  BoundWitnessStatsDiviner,
  LocationCertaintyDiviner,
  PayloadDiviner,
  PayloadStatsDiviner,
  SchemaStatsDiviner,
  XyoBoundWitnessWithMeta,
  XyoPayloadWithMeta,
} from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { JobProvider } from '@xyo-network/shared'
import { ContainerModule, interfaces } from 'inversify'

import { MONGO_TYPES } from '../mongoTypes'
import { MongoDBAddressHistoryDiviner } from './AddressHistory'
import { MongoDBAddressSpaceDiviner } from './AddressSpace'
import { MongoDBBoundWitnessDiviner } from './BoundWitness'
import { MongoDBBoundWitnessStatsDiviner, MongoDBBoundWitnessStatsDivinerConfigSchema } from './BoundWitnessStats'
import { MongoDBLocationCertaintyDiviner } from './LocationCertainty'
import { MongoDBPayloadDiviner } from './Payload'
import { MongoDBPayloadStatsDiviner, MongoDBPayloadStatsDivinerConfigSchema } from './PayloadStats'
import { MongoDBSchemaStatsDiviner, MongoDBSchemaStatsDivinerConfigSchema } from './SchemaStats'

let mongoDBAddressHistoryDiviner: MongoDBAddressHistoryDiviner
let mongoDBAddressSpaceDiviner: MongoDBAddressSpaceDiviner
let mongoDBBoundWitnessDiviner: MongoDBBoundWitnessDiviner
let mongoDBBoundWitnessStatsDiviner: MongoDBBoundWitnessStatsDiviner
let mongoDBLocationCertaintyDiviner: MongoDBLocationCertaintyDiviner
let mongoDBPayloadDiviner: MongoDBPayloadDiviner
let mongoDBPayloadStatsDiviner: MongoDBPayloadStatsDiviner
let mongoDBSchemaStatsDiviner: MongoDBSchemaStatsDiviner

const getMongoDBAddressHistoryDiviner = async (context: interfaces.Context) => {
  if (mongoDBAddressHistoryDiviner) return mongoDBAddressHistoryDiviner
  const boundWitnessSdk: BaseMongoSdk<XyoBoundWitnessWithMeta> = context.container.get<BaseMongoSdk<XyoBoundWitnessWithMeta>>(
    MONGO_TYPES.BoundWitnessSdk,
  )
  const params = {
    boundWitnessSdk,
    config: { name: TYPES.AddressHistoryDiviner.description, schema: XyoArchivistPayloadDivinerConfigSchema },
  }
  mongoDBAddressHistoryDiviner = await MongoDBAddressHistoryDiviner.create(params)
  return mongoDBAddressHistoryDiviner
}
const getMongoDBAddressSpaceDiviner = async (context: interfaces.Context) => {
  if (mongoDBAddressSpaceDiviner) return mongoDBAddressSpaceDiviner
  const boundWitnessSdk: BaseMongoSdk<XyoBoundWitnessWithMeta> = context.container.get<BaseMongoSdk<XyoBoundWitnessWithMeta>>(
    MONGO_TYPES.BoundWitnessSdk,
  )
  const params = { boundWitnessSdk, config: { name: TYPES.AddressSpaceDiviner.description, schema: XyoArchivistPayloadDivinerConfigSchema } }
  mongoDBAddressSpaceDiviner = await MongoDBAddressSpaceDiviner.create(params)
  return mongoDBAddressSpaceDiviner
}
const getMongoDBBoundWitnessDiviner = async (context: interfaces.Context) => {
  if (mongoDBBoundWitnessDiviner) return mongoDBBoundWitnessDiviner
  const boundWitnessSdk: BaseMongoSdk<XyoBoundWitnessWithMeta> = context.container.get<BaseMongoSdk<XyoBoundWitnessWithMeta>>(
    MONGO_TYPES.BoundWitnessSdk,
  )
  const params = { boundWitnessSdk, config: { name: TYPES.BoundWitnessDiviner.description, schema: XyoArchivistPayloadDivinerConfigSchema } }
  mongoDBBoundWitnessDiviner = await MongoDBBoundWitnessDiviner.create(params)
  return mongoDBBoundWitnessDiviner
}
const getMongoDBBoundWitnessStatsDiviner = async (context: interfaces.Context) => {
  if (mongoDBBoundWitnessStatsDiviner) return mongoDBBoundWitnessStatsDiviner
  const addressSpaceDiviner = await getMongoDBAddressSpaceDiviner(context)
  const boundWitnessSdk: BaseMongoSdk<XyoBoundWitnessWithMeta> = context.container.get<BaseMongoSdk<XyoBoundWitnessWithMeta>>(
    MONGO_TYPES.BoundWitnessSdk,
  )
  const params = {
    addressSpaceDiviner,
    boundWitnessSdk,
    config: { name: TYPES.BoundWitnessStatsDiviner.description, schema: MongoDBBoundWitnessStatsDivinerConfigSchema },
  }
  mongoDBBoundWitnessStatsDiviner = await MongoDBBoundWitnessStatsDiviner.create(params)
  return mongoDBBoundWitnessStatsDiviner
}
const getMongoDBLocationCertaintyDiviner = async (_context: interfaces.Context) => {
  if (mongoDBLocationCertaintyDiviner) return mongoDBLocationCertaintyDiviner
  mongoDBLocationCertaintyDiviner = (await MongoDBLocationCertaintyDiviner.create({
    config: { schema: XyoDivinerConfigSchema },
  })) as MongoDBLocationCertaintyDiviner
  return mongoDBLocationCertaintyDiviner
}
const getMongoDBPayloadDiviner = async (context: interfaces.Context) => {
  if (mongoDBPayloadDiviner) return mongoDBPayloadDiviner
  const payloadSdk: BaseMongoSdk<XyoPayloadWithMeta> = context.container.get<BaseMongoSdk<XyoPayloadWithMeta>>(MONGO_TYPES.PayloadSdk)
  const params = { config: { name: TYPES.PayloadDiviner.description, schema: XyoArchivistPayloadDivinerConfigSchema }, payloadSdk }
  mongoDBPayloadDiviner = await MongoDBPayloadDiviner.create(params)
  return mongoDBPayloadDiviner
}
const getMongoDBPayloadStatsDiviner = async (context: interfaces.Context) => {
  if (mongoDBPayloadStatsDiviner) return mongoDBPayloadStatsDiviner
  const addressSpaceDiviner = await getMongoDBAddressSpaceDiviner(context)
  const payloadSdk: BaseMongoSdk<XyoPayloadWithMeta> = context.container.get<BaseMongoSdk<XyoPayloadWithMeta>>(MONGO_TYPES.PayloadSdk)
  const params = {
    addressSpaceDiviner,
    config: { name: TYPES.PayloadStatsDiviner.description, schema: MongoDBPayloadStatsDivinerConfigSchema },
    payloadSdk,
  }
  mongoDBPayloadStatsDiviner = await MongoDBPayloadStatsDiviner.create(params)
  return mongoDBPayloadStatsDiviner
}
const getMongoDBSchemaStatsDiviner = async (context: interfaces.Context) => {
  if (mongoDBSchemaStatsDiviner) return mongoDBSchemaStatsDiviner
  const addressSpaceDiviner = await getMongoDBAddressSpaceDiviner(context)
  const payloadSdk: BaseMongoSdk<XyoPayloadWithMeta> = context.container.get<BaseMongoSdk<XyoPayloadWithMeta>>(MONGO_TYPES.PayloadSdk)
  const params = {
    addressSpaceDiviner,
    config: { name: TYPES.SchemaStatsDiviner.description, schema: MongoDBSchemaStatsDivinerConfigSchema },
    payloadSdk,
  }
  mongoDBSchemaStatsDiviner = await MongoDBSchemaStatsDiviner.create(params)
  return mongoDBSchemaStatsDiviner
}

export const DivinerContainerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(MongoDBAddressHistoryDiviner).toDynamicValue(getMongoDBAddressHistoryDiviner).inSingletonScope()
  bind<AddressHistoryDiviner>(TYPES.AddressHistoryDiviner).toDynamicValue(getMongoDBAddressHistoryDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBAddressHistoryDiviner).inSingletonScope()

  bind(MongoDBAddressSpaceDiviner).toDynamicValue(getMongoDBAddressSpaceDiviner).inSingletonScope()
  bind<AddressSpaceDiviner>(TYPES.AddressSpaceDiviner).toDynamicValue(getMongoDBAddressSpaceDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBAddressSpaceDiviner).inSingletonScope()

  bind(MongoDBBoundWitnessDiviner).toDynamicValue(getMongoDBBoundWitnessDiviner).inSingletonScope()
  bind<BoundWitnessDiviner>(TYPES.BoundWitnessDiviner).toDynamicValue(getMongoDBBoundWitnessDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBBoundWitnessDiviner).inSingletonScope()

  bind(MongoDBBoundWitnessStatsDiviner).toDynamicValue(getMongoDBBoundWitnessStatsDiviner).inSingletonScope()
  bind<BoundWitnessStatsDiviner>(TYPES.BoundWitnessStatsDiviner).toDynamicValue(getMongoDBBoundWitnessStatsDiviner).inSingletonScope()
  bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBBoundWitnessStatsDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBBoundWitnessStatsDiviner).inSingletonScope()

  bind(MongoDBLocationCertaintyDiviner).toDynamicValue(getMongoDBLocationCertaintyDiviner).inSingletonScope()
  bind<LocationCertaintyDiviner>(TYPES.ElevationDiviner).toDynamicValue(getMongoDBLocationCertaintyDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBLocationCertaintyDiviner).inSingletonScope()

  bind(MongoDBPayloadDiviner).toDynamicValue(getMongoDBPayloadDiviner).inSingletonScope()
  bind<PayloadDiviner>(TYPES.PayloadDiviner).toDynamicValue(getMongoDBPayloadDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBPayloadDiviner).inSingletonScope()

  bind(MongoDBPayloadStatsDiviner).toDynamicValue(getMongoDBPayloadStatsDiviner).inSingletonScope()
  bind<PayloadStatsDiviner>(TYPES.PayloadStatsDiviner).toDynamicValue(getMongoDBPayloadStatsDiviner).inSingletonScope()
  bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBPayloadStatsDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBPayloadStatsDiviner).inSingletonScope()

  bind(MongoDBSchemaStatsDiviner).toDynamicValue(getMongoDBSchemaStatsDiviner).inSingletonScope()
  bind<SchemaStatsDiviner>(TYPES.SchemaStatsDiviner).toDynamicValue(getMongoDBSchemaStatsDiviner).inSingletonScope()
  bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBSchemaStatsDiviner).inSingletonScope()
  bind<Module>(TYPES.Module).toDynamicValue(getMongoDBSchemaStatsDiviner).inSingletonScope()
})
