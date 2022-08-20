import { delay } from '@xylabs/delay'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoSystemInfoPayload } from './Payload'

export class XyoSystemInfoWitness<
  TSchema extends string,
  TPayload extends XyoSystemInfoPayload<TSchema> = XyoSystemInfoPayload<TSchema>,
  TConfig extends XyoWitnessConfig = XyoWitnessConfig,
> extends XyoWitness<TPayload, TConfig> {
  override async observe(fields?: Partial<TPayload>) {
    await delay(0)
    return super.observe(fields)
  }
}
