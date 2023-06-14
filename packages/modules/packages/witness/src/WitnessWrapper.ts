import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { WitnessObserveQuery, WitnessObserveQuerySchema } from './Queries'
import { Witness } from './Witness'

constructableModuleWrapper()
export class WitnessWrapper extends ModuleWrapper implements Witness {
  static override requiredQueries = [WitnessObserveQuerySchema, ...super.requiredQueries]

  observe(payloads?: Payload[]): Promise<Payload[]> {
    const queryPayload = PayloadWrapper.wrap<WitnessObserveQuery>({ schema: WitnessObserveQuerySchema })
    return this.sendQuery(queryPayload, [queryPayload.payload(), ...(payloads ?? [])])
  }
}

/** @deprecated use WitnessWrapper instead */
export class XyoWitnessWrapper extends WitnessWrapper {}
