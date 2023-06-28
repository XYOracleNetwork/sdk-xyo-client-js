import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { Witness, WitnessObserveQuery, WitnessObserveQuerySchema } from '@xyo-network/witness-model'

constructableModuleWrapper()
export class WitnessWrapper extends ModuleWrapper implements Witness {
  static override requiredQueries = [WitnessObserveQuerySchema, ...super.requiredQueries]

  observe(payloads?: Payload[]): Promise<Payload[]> {
    const queryPayload = PayloadWrapper.wrap<WitnessObserveQuery>({ schema: WitnessObserveQuerySchema })
    return this.sendQuery(queryPayload, [queryPayload.payload(), ...(payloads ?? [])])
  }
}
