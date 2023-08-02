import { EmptyPayload } from '@xyo-network/payload-model'

import { PassFailScore, Score } from './score'

export type PassFailScoringFunction<T extends EmptyPayload = EmptyPayload> = (payload: T) => PassFailScore | Promise<PassFailScore>
export type ScaledScoringFunction<T extends EmptyPayload = EmptyPayload> = (payload: T) => Score | Promise<Score>
export type ScoringFunction<T extends EmptyPayload = EmptyPayload> = PassFailScoringFunction<T> | ScaledScoringFunction<T>
