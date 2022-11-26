import { ModuleWrapper, XyoQueryBoundWitness } from '@xyo-network/module'
import { PayloadWrapper, XyoPayload, XyoPayloads } from '@xyo-network/payload'

import { XyoWitnessObserveQuery, XyoWitnessObserveQuerySchema } from './Queries'
import { Witness } from './Witness'

export class WitnessWrapper extends ModuleWrapper implements Witness {
  async observe(payloads?: XyoPayload[]): Promise<XyoPayloads> {
    const queryPayload = PayloadWrapper.parse<XyoWitnessObserveQuery>({ schema: XyoWitnessObserveQuerySchema })
    const query = await this.bindQuery(queryPayload, payloads)
    const queryBoundWitness: XyoQueryBoundWitness = query[0]
    const result = await this.module.query(queryBoundWitness, [queryPayload.payload, ...(payloads ?? [])])
    this.throwErrors(query, result)
    return result[1]
  }
}

/** @deprecated use WitnessWrapper instead */
export class XyoWitnessWrapper extends WitnessWrapper {}
