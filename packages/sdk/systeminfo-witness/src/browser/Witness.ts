import { delay } from '@xylabs/delay'
import { XyoPayload } from '@xyo-network/payload'
import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoSystemInfoWitness } from '../shared'
import { observeBowser } from './observeBowser'
import { XyoSystemInfoBrowserPayload } from './Payload'

export type XyoSystemInfoBrowserWitnessConfig<T extends XyoPayload = XyoPayload> = XyoWitnessConfig<
  {
    schema: 'network.xyo.system.info.browser.config'
    bowser?: Record<string, string>
  } & T
>

export class XyoSystemInfoBrowserWitness<
  T extends XyoSystemInfoBrowserPayload = XyoSystemInfoBrowserPayload,
  C extends XyoSystemInfoBrowserWitnessConfig<T> = XyoSystemInfoBrowserWitnessConfig<T>,
> extends XyoSystemInfoWitness<T, C> {
  override async observe(_fields?: Partial<T>): Promise<T> {
    await delay(0)
    const bowser = observeBowser()
    return super.observe({ bowser } as T)
  }
}
