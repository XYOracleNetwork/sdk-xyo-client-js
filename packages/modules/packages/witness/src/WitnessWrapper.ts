import { ModuleWrapper } from '@xyo-network/module'
import { PayloadWrapper, XyoPayload, XyoPayloads } from '@xyo-network/payload'

import { XyoWitnessObserveQuery, XyoWitnessObserveQuerySchema } from './Queries'
import { Witness } from './Witness'

export class WitnessWrapper extends ModuleWrapper implements Witness {
  observe(payloads?: XyoPayload[]): Promise<XyoPayloads> {
    const queryPayload = PayloadWrapper.parse<XyoWitnessObserveQuery>({ schema: XyoWitnessObserveQuerySchema })
    return this.sendQuery(queryPayload, [queryPayload.payload, ...(payloads ?? [])])
  }
}

/** @deprecated use WitnessWrapper instead */
export class XyoWitnessWrapper extends WitnessWrapper {}
