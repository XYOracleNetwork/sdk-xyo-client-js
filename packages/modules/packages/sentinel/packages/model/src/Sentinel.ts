import type { Promisable } from '@xylabs/sdk-js'
import type { AccountInstance } from '@xyo-network/account-model'
import type { ModuleQueryResult } from '@xyo-network/module-model'
import type { Payload } from '@xyo-network/payload-model'

export interface Sentinel<TIn extends Payload = Payload, TOut extends Payload = Payload> {
  report: (payloads?: TIn[]) => Promisable<TOut[]>
  reportQuery: (payloads?: TIn[], account?: AccountInstance) => Promisable<ModuleQueryResult<TOut>>
}
