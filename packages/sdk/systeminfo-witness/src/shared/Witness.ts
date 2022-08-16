import { delay } from '@xylabs/delay'
import { XyoWitness, XyoWitnessConfig, XyoWitnessQueryPayload } from '@xyo-network/witness'

import { XyoSystemInfoPayload } from './Payload'

export class XyoSystemInfoWitness<
  T extends XyoSystemInfoPayload = XyoSystemInfoPayload,
  Q extends XyoWitnessQueryPayload<T> = XyoWitnessQueryPayload<T>,
  C extends XyoWitnessConfig<Q> = XyoWitnessConfig<Q>,
> extends XyoWitness<T, Q, C> {
  override async observe(fields?: Partial<XyoSystemInfoPayload>, _query?: Q | undefined): Promise<T> {
    await delay(0)
    return { ...fields } as T
  }
}
