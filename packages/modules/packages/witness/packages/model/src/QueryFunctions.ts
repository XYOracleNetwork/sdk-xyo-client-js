import type { Promisable } from '@xylabs/promise'
import type { AccountInstance } from '@xyo-network/account-model'
import type { ModuleQueryResult } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

export interface WitnessQueryFunctions<TIn extends Payload = Payload, TOut extends Payload = Payload> {
  observe: (payloads?: TIn[]) => Promisable<TOut[]>
  observeQuery: (payloads?: TIn[], account?: AccountInstance) => Promisable<ModuleQueryResult<TOut>>
}
