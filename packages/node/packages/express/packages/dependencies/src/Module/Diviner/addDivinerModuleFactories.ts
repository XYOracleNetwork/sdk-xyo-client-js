/* eslint-disable max-statements */
import { HDWallet } from '@xyo-network/account'
import { NftCollectionScoreDiviner } from '@xyo-network/crypto-nft-collection-diviner-score-plugin'
import { NftScoreDiviner } from '@xyo-network/crypto-nft-diviner-score-plugin'
import { AddressHistoryDiviner } from '@xyo-network/diviner-address-history'
import { MemoryAddressSpaceDiviner } from '@xyo-network/diviner-address-space'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness'
import { MemoryBoundWitnessStatsDiviner } from '@xyo-network/diviner-boundwitness-stats'
import { ForecastingDivinerParams, MemoryForecastingDiviner } from '@xyo-network/diviner-forecasting'
import { DivinerParams } from '@xyo-network/diviner-model'
import { MemoryPayloadDiviner } from '@xyo-network/diviner-payload'
import { MemoryPayloadStatsDiviner } from '@xyo-network/diviner-payload-stats'
import { MemorySchemaListDiviner } from '@xyo-network/diviner-schema-list'
import { MemorySchemaStatsDiviner } from '@xyo-network/diviner-schema-stats'
import { ImageThumbnailDiviner, ImageThumbnailDivinerParams } from '@xyo-network/image-thumbnail-plugin'
import { CreatableModuleDictionary, ModuleFactory } from '@xyo-network/module-model'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
import { Container } from 'inversify'

const getWallet = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  return HDWallet.fromMnemonic(mnemonic)
}

const archivist = 'Archivist'

const getAddressHistoryDiviner = () => {
  const params: DivinerParams = { config: { schema: AddressHistoryDiviner.configSchema } }
  return new ModuleFactory(AddressHistoryDiviner, params)
}

const getAddressSpaceDiviner = () => {
  const params: DivinerParams = { config: { schema: MemoryAddressSpaceDiviner.configSchema } }
  return new ModuleFactory(MemoryAddressSpaceDiviner, params)
}
const getBoundWitnessDiviner = () => {
  const params: DivinerParams = { config: { schema: MemoryBoundWitnessDiviner.configSchema } }
  return new ModuleFactory(MemoryBoundWitnessDiviner, params)
}
const getBoundWitnessStatsDiviner = () => {
  const params: DivinerParams = { config: { archivist, schema: MemoryBoundWitnessStatsDiviner.configSchema } }
  return new ModuleFactory(MemoryBoundWitnessStatsDiviner, params)
}
const getImageThumbnailDiviner = async (container: Container) => {
  const wallet = await getWallet(container)
  const params: ImageThumbnailDivinerParams = {
    config: {
      accountDerivationPath: WALLET_PATHS.Diviners.ImageThumbnail,
      archivist: 'ThumbnailArchivist',
      name: TYPES.ImageThumbnailDiviner.description,
      payloadDiviner: TYPES.PayloadDiviner.description,
      schema: ImageThumbnailDiviner.configSchema,
    },
    wallet,
  }
  return new ModuleFactory(ImageThumbnailDiviner, params)
}

const getMemoryForecastingDiviner = async (container: Container) => {
  const wallet = await getWallet(container)
  const forecastingMethod = 'arimaForecasting'
  const jsonPathExpression = '$.feePerGas.medium'
  const witnessSchema = 'network.xyo.blockchain.ethereum.gas'
  const params: ForecastingDivinerParams = {
    config: {
      accountDerivationPath: WALLET_PATHS.Diviners.Forecasting,
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
const getNftCollectionScoreDiviner = () => {
  const params: DivinerParams = { config: { schema: NftCollectionScoreDiviner.configSchema } }
  return new ModuleFactory(NftCollectionScoreDiviner, params)
}
const getNftScoreDiviner = async (container: Container) => {
  const wallet = await getWallet(container)
  const params: DivinerParams = {
    config: {
      accountDerivationPath: WALLET_PATHS.Diviners.NftScoreDiviner,
      name: TYPES.NftScoreDiviner.description,
      schema: NftScoreDiviner.configSchema,
    },
    wallet,
  }
  return new ModuleFactory(NftScoreDiviner, params)
}
const getPayloadDiviner = async (container: Container) => {
  const wallet = await getWallet(container)
  const params: DivinerParams = {
    config: {
      accountDerivationPath: WALLET_PATHS.Diviners.Payload,
      archivist,
      name: TYPES.PayloadDiviner.description,
      schema: MemoryPayloadDiviner.configSchema,
    },
    wallet,
  }
  return new ModuleFactory(MemoryPayloadDiviner, params)
}
const getPayloadStatsDiviner = async (container: Container) => {
  const wallet = await getWallet(container)
  const params: DivinerParams = {
    config: {
      accountDerivationPath: WALLET_PATHS.Diviners.PayloadStats,
      archivist,
      name: TYPES.PayloadStatsDiviner.description,
      schema: MemoryPayloadStatsDiviner.configSchema,
    },
    wallet,
  }
  return new ModuleFactory(MemoryPayloadStatsDiviner, params)
}
const getSchemaListDiviner = async (container: Container) => {
  const wallet = await getWallet(container)
  const params: DivinerParams = {
    config: {
      accountDerivationPath: WALLET_PATHS.Diviners.SchemaList,
      archivist,
      name: TYPES.SchemaListDiviner.description,
      schema: MemorySchemaListDiviner.configSchema,
    },
    wallet,
  }
  return new ModuleFactory(MemorySchemaListDiviner, params)
}
const getSchemaStatsDiviner = async (container: Container) => {
  const wallet = await getWallet(container)
  const params: DivinerParams = {
    config: {
      accountDerivationPath: WALLET_PATHS.Diviners.SchemaStats,
      archivist,
      name: TYPES.SchemaStatsDiviner.description,
      schema: MemorySchemaStatsDiviner.configSchema,
    },
    wallet,
  }
  return new ModuleFactory(MemorySchemaStatsDiviner, params)
}

export const addDivinerModuleFactories = async (container: Container) => {
  const dictionary = container.get<CreatableModuleDictionary>(TYPES.CreatableModuleDictionary)
  // dictionary[AddressHistoryDiviner.configSchema] = getAddressHistoryDiviner()
  // dictionary[MemoryAddressSpaceDiviner.configSchema] = getAddressSpaceDiviner()
  // dictionary[MemoryBoundWitnessDiviner.configSchema] = getBoundWitnessDiviner()
  // dictionary[MemoryBoundWitnessStatsDiviner.configSchema] = getBoundWitnessStatsDiviner()
  dictionary[ImageThumbnailDiviner.configSchema] = await getImageThumbnailDiviner(container)
  dictionary[MemoryForecastingDiviner.configSchema] = await getMemoryForecastingDiviner(container)
  dictionary[MemoryPayloadDiviner.configSchema] = await getPayloadDiviner(container)
  dictionary[MemoryPayloadStatsDiviner.configSchema] = await getPayloadStatsDiviner(container)
  dictionary[MemorySchemaListDiviner.configSchema] = await getSchemaListDiviner(container)
  dictionary[MemorySchemaStatsDiviner.configSchema] = await getSchemaStatsDiviner(container)
  dictionary[NftCollectionScoreDiviner.configSchema] = getNftCollectionScoreDiviner()
  dictionary[NftScoreDiviner.configSchema] = await getNftScoreDiviner(container)
}
