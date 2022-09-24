import { XyoModuleWrapper } from '@xyo-network/module'
import { PayloadWrapper, XyoPayload } from '@xyo-network/payload'

import { XyoWitnessObserveQuery, XyoWitnessObserveQuerySchema } from './Queries'
import { Witness } from './Witness'

export class XyoWitnessWrapper extends XyoModuleWrapper implements Witness {
  async observe(payload?: Partial<XyoPayload> | undefined): Promise<XyoPayload | null> {
    const queryPayload = PayloadWrapper.parse<XyoWitnessObserveQuery>({ payload, schema: XyoWitnessObserveQuerySchema })
    const query = await this.bindQuery([queryPayload.body], queryPayload.hash)
    return (await this.module.query(query[0], query[1]))[1][0]
  }
}
