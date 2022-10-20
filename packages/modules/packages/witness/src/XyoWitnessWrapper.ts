import { XyoModuleWrapper, XyoQueryBoundWitness } from '@xyo-network/module'
import { PayloadWrapper, XyoPayload, XyoPayloads } from '@xyo-network/payload'

import { XyoWitnessObserveQuery, XyoWitnessObserveQuerySchema } from './Queries'
import { Witness } from './Witness'

export class XyoWitnessWrapper extends XyoModuleWrapper implements Witness {
  async observe(payloads?: Partial<XyoPayload>[]): Promise<XyoPayloads> {
    const queryPayload = PayloadWrapper.parse<XyoWitnessObserveQuery>({ payloads, schema: XyoWitnessObserveQuerySchema })
    const query = await this.bindQuery(queryPayload)
    const queryBoundWitness: XyoQueryBoundWitness = query[0]
    const result = await this.module.query(queryBoundWitness, [queryPayload.payload])
    this.throwErrors(query, result)
    return result[1]
  }
}
