import { CryptoContractDiviner } from '@xyo-network/crypto-contract-function-read-plugin'
import { NftCollectionScoreDiviner } from '@xyo-network/crypto-nft-collection-diviner-score-plugin'
import { NftScoreDiviner } from '@xyo-network/crypto-nft-diviner-score-plugin'
import { AddressHistoryDiviner } from '@xyo-network/diviner-address-history'
import { MemoryAddressSpaceDiviner } from '@xyo-network/diviner-address-space'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness'
import { MemoryBoundWitnessStatsDiviner } from '@xyo-network/diviner-boundwitness-stats'
import { ForecastingDivinerParams, MemoryForecastingDiviner } from '@xyo-network/diviner-forecasting'
import { MemoryPayloadDiviner } from '@xyo-network/diviner-payload'
import { MemoryPayloadStatsDiviner } from '@xyo-network/diviner-payload-stats'
import { MemorySchemaListDiviner } from '@xyo-network/diviner-schema-list'
import { MemorySchemaStatsDiviner } from '@xyo-network/diviner-schema-stats'
import {
  ImageThumbnailDiviner,
  ImageThumbnailIndexCandidateToImageThumbnailIndexDiviner,
  ImageThumbnailIndexQueryResponseToImageThumbnailQueryResponseDiviner,
  ImageThumbnailQueryToImageThumbnailIndexQueryDiviner,
  ImageThumbnailStateToIndexCandidateDiviner,
} from '@xyo-network/image-thumbnail-plugin'
import { ModuleFactory, ModuleFactoryLocator } from '@xyo-network/module-model'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
import { Container } from 'inversify'

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
  return ModuleFactory.withParams(MemoryForecastingDiviner, params)
}

export const addDivinerModuleFactories = (container: Container) => {
  const locator = container.get<ModuleFactoryLocator>(TYPES.ModuleFactoryLocator)
  locator.register(AddressHistoryDiviner)
  locator.register(ImageThumbnailStateToIndexCandidateDiviner)
  locator.register(ImageThumbnailIndexCandidateToImageThumbnailIndexDiviner)
  locator.register(ImageThumbnailQueryToImageThumbnailIndexQueryDiviner)
  locator.register(ImageThumbnailIndexQueryResponseToImageThumbnailQueryResponseDiviner)
  locator.register(ImageThumbnailDiviner)
  locator.register(MemoryAddressSpaceDiviner)
  locator.register(MemoryBoundWitnessDiviner)
  locator.register(MemoryBoundWitnessStatsDiviner)
  locator.register(getMemoryForecastingDiviner())
  locator.register(MemoryPayloadDiviner)
  locator.register(MemoryPayloadStatsDiviner)
  locator.register(MemorySchemaListDiviner)
  locator.register(MemorySchemaStatsDiviner)
  locator.register(NftCollectionScoreDiviner)
  locator.register(NftScoreDiviner)
  locator.register(CryptoContractDiviner)
}
