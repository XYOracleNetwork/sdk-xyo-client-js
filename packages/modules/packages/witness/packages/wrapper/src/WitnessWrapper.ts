import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { isWitnessInstance, isWitnessModule, Witness, WitnessObserveQuery, WitnessObserveQuerySchema } from '@xyo-network/witness-model'

constructableModuleWrapper()
export class WitnessWrapper extends ModuleWrapper implements Witness {
  static override instanceIdentityCheck = isWitnessInstance
  static override moduleIdentityCheck = isWitnessModule
  static override requiredQueries = [WitnessObserveQuerySchema, ...super.requiredQueries]

  async observe(payloads?: Payload[]): Promise<Payload[]> {
    if (isWitnessInstance(this.module)) {
      return await this.module.observe(payloads)
    }
    const queryPayload = PayloadWrapper.wrap<WitnessObserveQuery>({ schema: WitnessObserveQuerySchema })
    return await this.sendQuery(queryPayload, [queryPayload.payload(), ...(payloads ?? [])])
  }
}
