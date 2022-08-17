import { delay } from '@xylabs/delay'
import { XyoWitnessConfig, XyoWitnessQueryPayload } from '@xyo-network/witness'

import { XyoSystemInfoWitness } from '../shared'
import { observeBowser } from './observeBowser'
import { XyoSystemInfoBrowserPayload } from './Payload'

export interface XyoSystemInfoBrowserWitnessConfig<Q extends XyoWitnessQueryPayload = XyoWitnessQueryPayload> extends XyoWitnessConfig<Q> {
  bowser?: Record<string, string>
}

export class XyoSystemInfoBrowserWitness<
  T extends XyoSystemInfoBrowserPayload = XyoSystemInfoBrowserPayload,
  Q extends XyoWitnessQueryPayload<T> = XyoWitnessQueryPayload<T>,
  C extends XyoSystemInfoBrowserWitnessConfig<Q> = XyoSystemInfoBrowserWitnessConfig<Q>,
> extends XyoSystemInfoWitness<T, Q, C> {
  override async observe(_fields?: Partial<T>, _query?: Q | undefined): Promise<T> {
    await delay(0)
    const bowser = observeBowser()
    return super.observe({ bowser } as T)
  }
}
