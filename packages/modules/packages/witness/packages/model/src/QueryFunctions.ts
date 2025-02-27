import { Promisable } from '@xylabs/promise'
import { AccountInstance } from '@xyo-network/account-model'
import { ModuleQueryResult } from '@xyo-network/module-model'
import { Payload, WithoutPrivateStorageMeta } from '@xyo-network/payload-model'

export interface WitnessQueryFunctions<TIn extends Payload = Payload, TOut extends Payload = Payload> {
  observe: (payloads?: TIn[]) => Promisable<WithoutPrivateStorageMeta<TOut>[]>
  observeQuery: (payloads?: TIn[], account?: AccountInstance) => Promisable<ModuleQueryResult<TOut>>
}
