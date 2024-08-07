import { AccountInstance } from '@xyo-network/account-model'
import { ModuleQueryResult } from '@xyo-network/module-model'
import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module-wrapper'
import { Payload } from '@xyo-network/payload-model'
import {
  isWitnessInstance,
  isWitnessModule,
  WitnessInstance,
  WitnessModule,
  WitnessObserveQuery,
  WitnessObserveQuerySchema,
} from '@xyo-network/witness-model'

constructableModuleWrapper()
export class WitnessWrapper<TModule extends WitnessModule = WitnessModule>
  extends ModuleWrapper<TModule>
  implements WitnessInstance<TModule['params']> {
  static override instanceIdentityCheck = isWitnessInstance
  static override moduleIdentityCheck = isWitnessModule
  static override requiredQueries = [WitnessObserveQuerySchema, ...super.requiredQueries]

  async observe(payloads?: Payload[]): Promise<Payload[]> {
    const queryPayload: WitnessObserveQuery = { schema: WitnessObserveQuerySchema }
    return await this.sendQuery(queryPayload, [queryPayload, ...(payloads ?? [])])
  }

  async observeQuery(payloads?: Payload[], account?: AccountInstance): Promise<ModuleQueryResult> {
    const queryPayload: WitnessObserveQuery = { schema: WitnessObserveQuerySchema }
    return await this.sendQueryRaw(queryPayload, payloads, account)
  }
}
