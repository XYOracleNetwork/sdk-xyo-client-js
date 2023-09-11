/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-statements */
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
  const params: DivinerParams = { config: { schema: MemoryBoundWitnessStatsDiviner.configSchema } }
  return new ModuleFactory(MemoryBoundWitnessStatsDiviner, params)
}
const getImageThumbnailDiviner = () => {
  // TODO: Why can't we cast to generic params like others
  const params: ImageThumbnailDivinerParams = { config: { schema: ImageThumbnailDiviner.configSchema } }
  return new ModuleFactory(ImageThumbnailDiviner, params)
}

const getMemoryForecastingDiviner = () => {
  const forecastingMethod = 'arimaForecasting'
  const jsonPathExpression = '$.feePerGas.medium'
  const witnessSchema = 'network.xyo.blockchain.ethereum.gas'
  const params: ForecastingDivinerParams = {
    config: {
      accountDerivationPath: WALLET_PATHS.Diviners.Forecasting,
      forecastingMethod,
      jsonPathExpression,
      name: TYPES.ForecastingDiviner.description,
      schema: MemoryForecastingDiviner.configSchema,
      witnessSchema,
    },
  }
  return new ModuleFactory(MemoryForecastingDiviner, params)
}
const getNftCollectionScoreDiviner = () => {
  const params: DivinerParams = { config: { schema: NftCollectionScoreDiviner.configSchema } }
  return new ModuleFactory(NftCollectionScoreDiviner, params)
}
const getNftScoreDiviner = () => {
  const params: DivinerParams = { config: { schema: NftScoreDiviner.configSchema } }
  return new ModuleFactory(NftScoreDiviner, params)
}
const getPayloadDiviner = () => {
  const params: DivinerParams = { config: { schema: MemoryPayloadDiviner.configSchema } }
  return new ModuleFactory(MemoryPayloadDiviner, params)
}
const getPayloadStatsDiviner = () => {
  const params: DivinerParams = { config: { schema: MemoryPayloadStatsDiviner.configSchema } }
  return new ModuleFactory(MemoryPayloadStatsDiviner, params)
}
const getSchemaListDiviner = () => {
  const params: DivinerParams = { config: { schema: MemorySchemaListDiviner.configSchema } }
  return new ModuleFactory(MemorySchemaListDiviner, params)
}
const getSchemaStatsDiviner = () => {
  const params: DivinerParams = { config: { schema: MemorySchemaStatsDiviner.configSchema } }
  return new ModuleFactory(MemorySchemaStatsDiviner, params)
}

export const addDivinerModuleFactories = (container: Container) => {
  const dictionary = container.get<CreatableModuleDictionary>(TYPES.CreatableModuleDictionary)
  // dictionary[AddressHistoryDiviner.configSchema] = getAddressHistoryDiviner()
  // dictionary[MemoryAddressSpaceDiviner.configSchema] = getAddressSpaceDiviner()
  // dictionary[MemoryBoundWitnessDiviner.configSchema] = getBoundWitnessDiviner()
  // dictionary[MemoryBoundWitnessStatsDiviner.configSchema] = getBoundWitnessStatsDiviner()
  dictionary[ImageThumbnailDiviner.configSchema] = getImageThumbnailDiviner()
  dictionary[MemoryForecastingDiviner.configSchema] = getMemoryForecastingDiviner()
  // dictionary[MemoryPayloadDiviner.configSchema] = getPayloadDiviner()
  // dictionary[MemoryPayloadStatsDiviner.configSchema] = getPayloadStatsDiviner()
  // dictionary[MemorySchemaListDiviner.configSchema] = getSchemaListDiviner()
  // dictionary[MemorySchemaStatsDiviner.configSchema] = getSchemaStatsDiviner()
  dictionary[NftCollectionScoreDiviner.configSchema] = getNftCollectionScoreDiviner()
  dictionary[NftScoreDiviner.configSchema] = getNftScoreDiviner()
}
