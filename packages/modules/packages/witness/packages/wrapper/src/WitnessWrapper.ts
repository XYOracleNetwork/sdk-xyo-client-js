import type { AccountInstance } from '@xyo-network/account-model'
import type { ModuleQueryResult } from '@xyo-network/module-model'
import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module-wrapper'
import type { Payload } from '@xyo-network/payload-model'
import type {
  WitnessInstance,
  WitnessModule,
  WitnessObserveQuery,
} from '@xyo-network/witness-model'
import {
  isWitnessInstance,
  isWitnessModule,
  WitnessObserveQuerySchema,
} from '@xyo-network/witness-model'

constructableModuleWrapper()
export class WitnessWrapper<TModule extends WitnessModule = WitnessModule>
  extends ModuleWrapper<TModule>
  implements WitnessInstance<TModule['params']> {
  static override readonly instanceIdentityCheck = isWitnessInstance
  static override readonly moduleIdentityCheck = isWitnessModule
  static override readonly requiredQueries = [WitnessObserveQuerySchema, ...super.requiredQueries]

  async observe(payloads?: Payload[]): Promise<Payload[]> {
    const queryPayload: WitnessObserveQuery = { schema: WitnessObserveQuerySchema }
    return await this.sendQuery(queryPayload, [queryPayload, ...(payloads ?? [])])
  }

  async observeQuery(payloads?: Payload[], account?: AccountInstance): Promise<ModuleQueryResult> {
    const queryPayload: WitnessObserveQuery = { schema: WitnessObserveQuerySchema }
    return await this.sendQueryRaw(queryPayload, payloads, account)
  }
}
