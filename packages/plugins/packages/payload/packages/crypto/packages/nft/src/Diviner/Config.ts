import { NftScoreSchema } from "./Schema"
import { DivinerConfig } from '@xyo-network/diviner-model'

export type NftScoreDivinerConfigSchema = `${NftScoreSchema}.diviner.config`
export const NftScoreDivinerConfigSchema: NftScoreDivinerConfigSchema = `${NftScoreSchema}.diviner.config`

export type NftScoreDivinerConfig = DivinerConfig<{ schema: NftScoreDivinerConfigSchema }>
