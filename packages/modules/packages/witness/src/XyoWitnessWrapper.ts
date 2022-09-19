import { XyoModuleWrapper } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

import { XyoWitnessObserveQuerySchema, XyoWitnessQuery } from './Queries'
import { Witness } from './Witness'

export class XyoWitnessWrapper extends XyoModuleWrapper implements Witness {
  async observe(payload?: Partial<XyoPayload> | undefined): Promise<XyoPayload | null> {
    const query: XyoWitnessQuery = { payload, schema: XyoWitnessObserveQuerySchema }
    return (await this.module.query(query))[1][0]
  }
}
