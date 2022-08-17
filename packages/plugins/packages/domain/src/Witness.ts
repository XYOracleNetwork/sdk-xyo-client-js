import { delay } from '@xylabs/delay'
import { XyoPayload } from '@xyo-network/payload'
import { XyoWitness, XyoWitnessQueryPayload } from '@xyo-network/witness'

import { XyoDomainPayload } from './Payload'

export type XyoDomainWitnessQueryPayload = XyoWitnessQueryPayload<{ schema: 'network.xyo.domain.query'; domain: string }>

export class XyoDomainWitness extends XyoWitness<XyoDomainPayload> {
  override async observe(
    _payload: Partial<XyoDomainPayload>,
    _query?: XyoWitnessQueryPayload<XyoPayload<{ schema: string }>> | undefined,
  ): Promise<XyoDomainPayload> {
    await delay(0)
    return { schema: 'network.xyo.domain' }
  }
  public static dmarc = '_xyo'

  public static generateDmarc(domain: string) {
    return `${XyoDomainWitness.dmarc}.${domain}`
  }
}
