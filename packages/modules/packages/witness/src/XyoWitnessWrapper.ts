import { XyoModuleWrapper, XyoQueryBoundWitness } from '@xyo-network/module'
import { PayloadWrapper, XyoPayload, XyoPayloads } from '@xyo-network/payload'

import { XyoWitnessObserveQuery, XyoWitnessObserveQuerySchema } from './Queries'
import { Witness } from './Witness'

export class XyoWitnessWrapper extends XyoModuleWrapper implements Witness {
  async observe(payloads?: Partial<XyoPayload>[]): Promise<XyoPayloads> {
    const queryPayload = PayloadWrapper.parse<XyoWitnessObserveQuery>({ payloads, schema: XyoWitnessObserveQuerySchema })
    const queryResult = await this.bindQuery(queryPayload)
    const queryBoundWitness: XyoQueryBoundWitness = queryResult[0]
    return (await this.module.query(queryBoundWitness, [queryPayload.payload]))[1]
  }
}
