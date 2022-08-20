import { delay } from '@xylabs/delay'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoSystemInfoPayload } from './Payload'

export class XyoSystemInfoWitness<
  T extends XyoSystemInfoPayload = XyoSystemInfoPayload,
  C extends XyoWitnessConfig = XyoWitnessConfig,
> extends XyoWitness<T, C> {
  override async observe(fields?: Partial<T>): Promise<T> {
    await delay(0)
    return super.observe(fields)
  }
}
