/* eslint-disable max-statements */
import { Account } from '@xyo-network/account'
import {
  AddressHistoryDivinerConfig,
  AddressSpaceDivinerConfig,
  BoundWitnessDivinerConfig,
  BoundWitnessStatsDivinerConfig,
  LocationCertaintyDivinerConfig,
  PayloadStatsDivinerConfig,
  SchemaStatsDivinerConfig,
  XyoArchivistPayloadDivinerConfig,
} from '@xyo-network/diviner'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { BoundWitnessWithMeta, ConfigModuleFactoryDictionary, PayloadWithMeta } from '@xyo-network/node-core-model'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Container } from 'inversify'

import { getBoundWitnessSdk, getPayloadSdk } from '../Mongo'
import { MongoDBAddressHistoryDiviner } from './AddressHistory'
import { MongoDBAddressSpaceDiviner } from './AddressSpace'
import { MongoDBBoundWitnessDiviner } from './BoundWitness'
import { MongoDBBoundWitnessStatsDiviner } from './BoundWitnessStats'
import { MongoDBLocationCertaintyDiviner } from './LocationCertainty'
import { MongoDBPayloadDiviner } from './Payload'
import { MongoDBPayloadStatsDiviner } from './PayloadStats'
import { MongoDBSchemaListDiviner, MongoDBSchemaListDivinerConfig } from './SchemaList'
import { MongoDBSchemaStatsDiviner } from './SchemaStats'

const getMongoDBAddressHistoryDiviner = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Diviners.AddressHistory)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const factory = (config: AnyConfigSchema<AddressHistoryDivinerConfig>) => {
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
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const factory = (config: AnyConfigSchema<AddressSpaceDivinerConfig>) => {
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
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const factory = (config: AnyConfigSchema<BoundWitnessDivinerConfig>) => {
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
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const factory = (config: AnyConfigSchema<BoundWitnessStatsDivinerConfig>) => {
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
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = getPayloadSdk()
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
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = getPayloadSdk()
  const factory = (config: AnyConfigSchema<PayloadStatsDivinerConfig>) => {
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
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
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
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const factory = (config: AnyConfigSchema<SchemaStatsDivinerConfig>) => {
    const params = {
      account,
      boundWitnessSdk,
      config: { ...config, name: TYPES.SchemaStatsDiviner.description, schema: MongoDBSchemaStatsDiviner.configSchema },
    }
    return MongoDBSchemaStatsDiviner.create(params)
  }
  return factory
}

export const addDivinerConfigModuleFactories = (container: Container) => {
  const dictionary = container.get<ConfigModuleFactoryDictionary>(TYPES.ConfigModuleFactoryDictionary)
  dictionary[MongoDBAddressHistoryDiviner.configSchema] = getMongoDBAddressHistoryDiviner(container)
  dictionary[MongoDBAddressSpaceDiviner.configSchema] = getMongoDBAddressSpaceDiviner(container)
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
