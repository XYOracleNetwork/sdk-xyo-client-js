import { Payload } from '@xyo-network/payload-model'

import { NftCollectionScoreSchema } from './Schema'

export type NftCollectionAnalysis = Record<string, [score: number, total: number]>

export type NftCollectionScorePayload = Payload<{ schema: NftCollectionScoreSchema } & Partial<Omit<NftCollectionAnalysis, 'schema'>>>
export const isNftCollectionScorePayload = (x?: Payload | null): x is NftCollectionScorePayload => x?.schema === NftCollectionScoreSchema
