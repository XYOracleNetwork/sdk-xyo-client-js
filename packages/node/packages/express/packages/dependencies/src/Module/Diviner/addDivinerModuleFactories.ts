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
import { ModuleFactory, ModuleFactoryLocator } from '@xyo-network/module-model'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
import { Container } from 'inversify'

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

export const addDivinerModuleFactories = (container: Container) => {
  const locator = container.get<ModuleFactoryLocator>(TYPES.ModuleFactoryLocator)
  locator.register(ImageThumbnailDiviner)
  locator.register(MemoryForecastingDiviner)
  locator.register(NftCollectionScoreDiviner)
  locator.register(NftScoreDiviner)

  // TODO: Uncomment and specify non-memory in config
  // locator.register(AddressHistoryDiviner)
  // locator.register(MemoryAddressSpaceDiviner)
  // locator.register(MemoryBoundWitnessDiviner)
  // locator.register(MemoryBoundWitnessStatsDiviner)
  // locator.register(MemoryPayloadDiviner)
  // locator.register(MemoryPayloadStatsDiviner)
  // locator.register(MemorySchemaListDiviner)
  // locator.register(MemorySchemaStatsDiviner)
}
