import { Promisable } from '@xylabs/promise'
import { Payload } from '@xyo-network/payload-model'

export interface WitnessQueryFunctions<TIn extends Payload = Payload, TOut extends Payload = Payload> {
  observe: (payloads?: TIn[]) => Promisable<TOut[]>
}
