import { Promisable } from '@xylabs/promise'
import { AccountInstance } from '@xyo-network/account-model'
import { ModuleQueryResult } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export interface Sentinel<TIn extends Payload = Payload, TOut extends Payload = Payload> {
  report: (payloads?: TIn[]) => Promisable<TOut[]>
  reportQuery: (account: AccountInstance, payloads?: TIn[]) => Promisable<ModuleQueryResult<TOut>>
}
