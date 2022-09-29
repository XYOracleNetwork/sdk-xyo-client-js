import { XyoModuleWrapper, XyoQueryBoundWitness } from '@xyo-network/module'
import { PayloadWrapper, XyoPayload } from '@xyo-network/payload'

import { XyoWitnessObserveQuery, XyoWitnessObserveQuerySchema } from './Queries'
import { Witness } from './Witness'

export class XyoWitnessWrapper extends XyoModuleWrapper implements Witness {
  async observe(payload?: Partial<XyoPayload> | undefined): Promise<XyoPayload | null> {
    const queryPayload = PayloadWrapper.parse<XyoWitnessObserveQuery>({ payload, schema: XyoWitnessObserveQuerySchema })
    const queryResult = await this.bindQuery(queryPayload)
    const queryBoundWitness: XyoQueryBoundWitness = queryResult[0]
    console.log(`queryBoundWitness: ${JSON.stringify(queryBoundWitness, null, 2)}`)
    console.log(`queryPayload-hash: ${queryPayload.hash}`)
    console.log(`queryResult: ${JSON.stringify(queryResult, null, 2)}`)
    return (await this.module.query(queryBoundWitness, [queryPayload.payload]))[1][0]
  }
}
