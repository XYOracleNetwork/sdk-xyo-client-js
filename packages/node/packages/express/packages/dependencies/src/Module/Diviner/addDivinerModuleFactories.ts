/* eslint-disable max-statements */
import { HDWallet } from '@xyo-network/account'
import { NftCollectionScoreDiviner } from '@xyo-network/crypto-nft-collection-diviner-score-plugin'
import { NftScoreDiviner } from '@xyo-network/crypto-nft-diviner-score-plugin'
import { AddressHistoryDiviner } from '@xyo-network/diviner-address-history'
import { MemoryAddressSpaceDiviner } from '@xyo-network/diviner-address-space'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness'
import { MemoryBoundWitnessStatsDiviner } from '@xyo-network/diviner-boundwitness-stats'
import { MemoryForecastingDiviner } from '@xyo-network/diviner-forecasting'
import { MemoryPayloadDiviner } from '@xyo-network/diviner-payload'
import { MemoryPayloadStatsDiviner } from '@xyo-network/diviner-payload-stats'
import { MemorySchemaListDiviner } from '@xyo-network/diviner-schema-list'
import { MemorySchemaStatsDiviner } from '@xyo-network/diviner-schema-stats'
import { CreatableModuleDictionary, ModuleFactory } from '@xyo-network/module-model'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
import { Container } from 'inversify'

const getWallet = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  return HDWallet.fromMnemonic(mnemonic)
}

const archivist = 'Archivist'

const getAddressHistoryDiviner = async (container: Container) => {
  const wallet = await getWallet(container)
  const params = {
    accountDerivationPath: WALLET_PATHS.Diviners.AddressHistory,
    config: { archivist, name: TYPES.AddressHistoryDiviner.description, schema: AddressHistoryDiviner.configSchema },
    wallet,
  }
  return new ModuleFactory(AddressHistoryDiviner, params)
}
const getAddressSpaceDiviner = async (container: Container) => {
  const wallet = await getWallet(container)
  const params = {
    accountDerivationPath: WALLET_PATHS.Diviners.AddressSpace,
    config: { archivist, name: TYPES.AddressSpaceDiviner.description, schema: MemoryAddressSpaceDiviner.configSchema },
    wallet,
  }
  return new ModuleFactory(MemoryAddressSpaceDiviner, params)
}
const getBoundWitnessDiviner = async (container: Container) => {
  const wallet = await getWallet(container)
  const params = {
    accountDerivationPath: WALLET_PATHS.Diviners.BoundWitness,
    config: { archivist, name: TYPES.BoundWitnessDiviner.description, schema: MemoryBoundWitnessDiviner.configSchema },
    wallet,
  }
  return new ModuleFactory(MemoryBoundWitnessDiviner, params)
}
const getBoundWitnessStatsDiviner = async (container: Container) => {
  const wallet = await getWallet(container)
  const params = {
    accountDerivationPath: WALLET_PATHS.Diviners.BoundWitnessStats,
    config: { archivist, name: TYPES.BoundWitnessStatsDiviner.description, schema: MemoryBoundWitnessStatsDiviner.configSchema },
    wallet,
  }
  return new ModuleFactory(MemoryBoundWitnessStatsDiviner, params)
}
const getMemoryForecastingDiviner = async (container: Container) => {
  const wallet = await getWallet(container)
  const forecastingMethod = 'arimaForecasting'
  const jsonPathExpression = '$.feePerGas.medium'
  const witnessSchema = 'network.xyo.blockchain.ethereum.gas'
  const params = {
    accountDerivationPath: WALLET_PATHS.Diviners.Forecasting,
    config: {
      archivist,
      forecastingMethod,
      jsonPathExpression,
      name: TYPES.ForecastingDiviner.description,
      schema: MemoryForecastingDiviner.configSchema,
      witnessSchema,
    },
    wallet,
  }
  return new ModuleFactory(MemoryForecastingDiviner, params)
}
const getNftCollectionScoreDiviner = async (container: Container) => {
  const wallet = await getWallet(container)
  const params = {
    accountDerivationPath: WALLET_PATHS.Diviners.NftCollectionScoreDiviner,
    config: { name: TYPES.NftCollectionScoreDiviner.description, schema: NftCollectionScoreDiviner.configSchema },
    wallet,
  }
  return new ModuleFactory(NftCollectionScoreDiviner, params)
}
const getNftScoreDiviner = async (container: Container) => {
  const wallet = await getWallet(container)
  const params = {
    accountDerivationPath: WALLET_PATHS.Diviners.NftScoreDiviner,
    config: { name: TYPES.NftScoreDiviner.description, schema: NftScoreDiviner.configSchema },
    wallet,
  }
  return new ModuleFactory(NftScoreDiviner, params)
}
const getPayloadDiviner = async (container: Container) => {
  const wallet = await getWallet(container)
  const params = {
    accountDerivationPath: WALLET_PATHS.Diviners.Payload,
    config: { archivist, name: TYPES.PayloadDiviner.description, schema: MemoryPayloadDiviner.configSchema },
    wallet,
  }
  return new ModuleFactory(MemoryPayloadDiviner, params)
}
const getPayloadStatsDiviner = async (container: Container) => {
  const wallet = await getWallet(container)
  const params = {
    accountDerivationPath: WALLET_PATHS.Diviners.PayloadStats,
    config: { archivist, name: TYPES.PayloadStatsDiviner.description, schema: MemoryPayloadStatsDiviner.configSchema },
    wallet,
  }
  return new ModuleFactory(MemoryPayloadStatsDiviner, params)
}
const getSchemaListDiviner = async (container: Container) => {
  const wallet = await getWallet(container)
  const params = {
    accountDerivationPath: WALLET_PATHS.Diviners.SchemaList,
    config: { archivist, name: TYPES.SchemaListDiviner.description, schema: MemorySchemaListDiviner.configSchema },
    wallet,
  }
  return new ModuleFactory(MemorySchemaListDiviner, params)
}
const getSchemaStatsDiviner = async (container: Container) => {
  const wallet = await getWallet(container)
  const params = {
    accountDerivationPath: WALLET_PATHS.Diviners.SchemaStats,
    config: { archivist, name: TYPES.SchemaStatsDiviner.description, schema: MemorySchemaStatsDiviner.configSchema },
    wallet,
  }
  return new ModuleFactory(MemorySchemaStatsDiviner, params)
}

export const addDivinerModuleFactories = async (container: Container) => {
  const dictionary = container.get<CreatableModuleDictionary>(TYPES.CreatableModuleDictionary)
  dictionary[AddressHistoryDiviner.configSchema] = await getAddressHistoryDiviner(container)
  dictionary[MemoryAddressSpaceDiviner.configSchema] = await getAddressSpaceDiviner(container)
  dictionary[MemoryBoundWitnessDiviner.configSchema] = await getBoundWitnessDiviner(container)
  dictionary[MemoryBoundWitnessStatsDiviner.configSchema] = await getBoundWitnessStatsDiviner(container)
  dictionary[MemoryForecastingDiviner.configSchema] = await getMemoryForecastingDiviner(container)
  dictionary[MemoryPayloadDiviner.configSchema] = await getPayloadDiviner(container)
  dictionary[MemoryPayloadStatsDiviner.configSchema] = await getPayloadStatsDiviner(container)
  dictionary[MemorySchemaListDiviner.configSchema] = await getSchemaListDiviner(container)
  dictionary[MemorySchemaStatsDiviner.configSchema] = await getSchemaStatsDiviner(container)
  dictionary[NftCollectionScoreDiviner.configSchema] = await getNftCollectionScoreDiviner(container)
  dictionary[NftScoreDiviner.configSchema] = await getNftScoreDiviner(container)
}
