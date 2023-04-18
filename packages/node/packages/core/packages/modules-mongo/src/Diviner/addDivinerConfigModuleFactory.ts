/* eslint-disable max-statements */
import { Account } from '@xyo-network/account'
import { XyoArchivistPayloadDivinerConfig } from '@xyo-network/diviner'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { BoundWitnessWithMeta, ConfigModuleFactoryDictionary, LocationCertaintyDivinerConfig, PayloadWithMeta } from '@xyo-network/node-core-model'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Container } from 'inversify'

import { MONGO_TYPES } from '../mongoTypes'
import { MongoDBAddressHistoryDiviner } from './AddressHistory'
import { MongoDBAddressSpaceDiviner } from './AddressSpace'
import { MongoDBBoundWitnessDiviner } from './BoundWitness'
import { MongoDBBoundWitnessStatsDiviner, MongoDBBoundWitnessStatsDivinerConfig } from './BoundWitnessStats'
import { MongoDBLocationCertaintyDiviner } from './LocationCertainty'
import { MongoDBPayloadDiviner } from './Payload'
import { MongoDBPayloadStatsDiviner, MongoDBPayloadStatsDivinerConfig } from './PayloadStats'
import { MongoDBSchemaListDiviner, MongoDBSchemaListDivinerConfig } from './SchemaList'
import { MongoDBSchemaStatsDiviner } from './SchemaStats'

const getMongoDBAddressHistoryDiviner = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.AddressHistory)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = container.get<BaseMongoSdk<BoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdk)
  const factory = (config: AnyConfigSchema<XyoArchivistPayloadDivinerConfig>) => {
    const params = {
      account,
      boundWitnessSdk,
      config: { ...config, name: TYPES.AddressHistoryDiviner.description },
    }
    return MongoDBAddressHistoryDiviner.create(params)
  }
  return factory
}
const getMongoDBAddressSpaceDiviner = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.AddressSpace)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = container.get<BaseMongoSdk<BoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdk)
  const factory = (config: AnyConfigSchema<XyoArchivistPayloadDivinerConfig>) => {
    const params = {
      account,
      boundWitnessSdk,
      config: { ...config, name: TYPES.AddressSpaceDiviner.description },
    }
    return MongoDBAddressSpaceDiviner.create(params)
  }
  return factory
}
const getMongoDBBoundWitnessDiviner = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.BoundWitness)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = container.get<BaseMongoSdk<BoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdk)
  const factory = (config: AnyConfigSchema<XyoArchivistPayloadDivinerConfig>) => {
    const params = {
      account,
      boundWitnessSdk,
      config: { ...config, name: TYPES.BoundWitnessDiviner.description },
    }
    return MongoDBBoundWitnessDiviner.create(params)
  }
  return factory
}
const getMongoDBBoundWitnessStatsDiviner = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.BoundWitnessStats)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = container.get<BaseMongoSdk<BoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdk)
  const factory = (config: AnyConfigSchema<MongoDBBoundWitnessStatsDivinerConfig>) => {
    const params = {
      account,
      boundWitnessSdk,
      config: { ...config, name: TYPES.BoundWitnessStatsDiviner.description },
    }
    return MongoDBBoundWitnessStatsDiviner.create(params)
  }
  return factory
}
const getMongoDBLocationCertaintyDiviner = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.LocationCertainty)
  const factory = (config: AnyConfigSchema<LocationCertaintyDivinerConfig>) => {
    return MongoDBLocationCertaintyDiviner.create({ account, config: { ...config, schema: MongoDBLocationCertaintyDiviner.configSchema } })
  }
  return factory
}
const getMongoDBPayloadDiviner = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.Payload)
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = container.get<BaseMongoSdk<PayloadWithMeta>>(MONGO_TYPES.PayloadSdk)
  const factory = (config: AnyConfigSchema<XyoArchivistPayloadDivinerConfig>) => {
    const params = {
      account,
      config: { ...config, name: TYPES.PayloadDiviner.description },
      payloadSdk,
    }
    return MongoDBPayloadDiviner.create(params)
  }
  return factory
}
const getMongoDBPayloadStatsDiviner = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.PayloadStats)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = container.get<BaseMongoSdk<BoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdk)
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = container.get<BaseMongoSdk<PayloadWithMeta>>(MONGO_TYPES.PayloadSdk)
  const factory = (config: AnyConfigSchema<MongoDBPayloadStatsDivinerConfig>) => {
    const params = {
      account,
      boundWitnessSdk,
      config: { ...config, name: TYPES.PayloadStatsDiviner.description },
      payloadSdk,
    }
    return MongoDBPayloadStatsDiviner.create(params)
  }
  return factory
}
const getMongoDBSchemaListDiviner = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.SchemaList)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = container.get<BaseMongoSdk<BoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdk)
  const factory = (config: AnyConfigSchema<MongoDBSchemaListDivinerConfig>) => {
    const params = {
      account,
      boundWitnessSdk,
      config: { ...config, name: TYPES.SchemaListDiviner.description },
    }
    return MongoDBSchemaListDiviner.create(params)
  }
  return factory
}
const getMongoDBSchemaStatsDiviner = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.SchemaStats)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = container.get<BaseMongoSdk<BoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdk)
  const factory = (config: AnyConfigSchema<MongoDBSchemaListDivinerConfig>) => {
    const params = {
      account,
      boundWitnessSdk,
      config: { ...config, name: TYPES.SchemaStatsDiviner.description, schema: MongoDBSchemaStatsDiviner.configSchema },
    }
    return MongoDBSchemaStatsDiviner.create(params)
  }
  return factory
}

export const addDivinerConfigModuleFactory = (container: Container) => {
  const dictionary = container.get<ConfigModuleFactoryDictionary>(TYPES.ConfigModuleFactoryDictionary)
  dictionary[MongoDBAddressHistoryDiviner.configSchema] = getMongoDBAddressHistoryDiviner(container)
  dictionary[MongoDBSchemaStatsDiviner.configSchema] = getMongoDBAddressSpaceDiviner(container)
  dictionary[MongoDBBoundWitnessDiviner.configSchema] = getMongoDBBoundWitnessDiviner(container)
  dictionary[MongoDBBoundWitnessStatsDiviner.configSchema] = getMongoDBBoundWitnessStatsDiviner(container)
  dictionary[MongoDBLocationCertaintyDiviner.configSchema] = getMongoDBLocationCertaintyDiviner(container)
  dictionary[MongoDBPayloadDiviner.configSchema] = getMongoDBPayloadDiviner(container)
  dictionary[MongoDBPayloadStatsDiviner.configSchema] = getMongoDBPayloadStatsDiviner(container)
  dictionary[MongoDBSchemaListDiviner.configSchema] = getMongoDBSchemaListDiviner(container)
  dictionary[MongoDBSchemaStatsDiviner.configSchema] = getMongoDBSchemaStatsDiviner(container)

  // bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBBoundWitnessStatsDiviner).inSingletonScope()
  // bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBPayloadStatsDiviner).inSingletonScope()
  // bind<JobProvider>(TYPES.JobProvider).toDynamicValue(getMongoDBSchemaStatsDiviner).inSingletonScope()
}
