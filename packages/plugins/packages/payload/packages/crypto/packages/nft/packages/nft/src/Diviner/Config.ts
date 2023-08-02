import { DivinerConfig } from '@xyo-network/diviner-model'

import { NftScoreSchema } from './Schema'

export type NftScoreDivinerConfigSchema = `${NftScoreSchema}.diviner.config`
export const NftScoreDivinerConfigSchema: NftScoreDivinerConfigSchema = `${NftScoreSchema}.diviner.config`

export type NftScoreDivinerConfig = DivinerConfig<{ schema: NftScoreDivinerConfigSchema }>
