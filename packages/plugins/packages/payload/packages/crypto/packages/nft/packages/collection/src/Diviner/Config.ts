import { DivinerConfig } from '@xyo-network/diviner-model'

import { NftCollectionScoreSchema } from './Schema'

export type NftCollectionScoreDivinerConfigSchema = `${NftCollectionScoreSchema}.diviner.config`
export const NftCollectionScoreDivinerConfigSchema: NftCollectionScoreDivinerConfigSchema = `${NftCollectionScoreSchema}.diviner.config`

export type NftCollectionScoreDivinerConfig = DivinerConfig<{ schema: NftCollectionScoreDivinerConfigSchema }>
