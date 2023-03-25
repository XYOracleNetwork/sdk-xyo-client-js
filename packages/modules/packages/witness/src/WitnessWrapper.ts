import { assertEx } from '@xylabs/assert'
import { AccountInstance } from '@xyo-network/account-model'
import { Module, ModuleWrapper } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { WitnessObserveQuery, WitnessObserveQuerySchema } from './Queries'
import { Witness } from './Witness'

export class WitnessWrapper extends ModuleWrapper implements Witness {
  static override requiredQueries = [WitnessObserveQuerySchema, ...super.requiredQueries]

  static override tryWrap(module?: Module, account?: AccountInstance): WitnessWrapper | undefined {
    if (module) {
      const missingRequiredQueries = this.missingRequiredQueries(module)
      if (missingRequiredQueries.length > 0) {
        //console.warn(`Missing queries: ${JSON.stringify(missingRequiredQueries, null, 2)}`)
      } else {
        return new WitnessWrapper({ account, module })
      }
    }
  }

  static override wrap(module?: Module, account?: AccountInstance): WitnessWrapper {
    return assertEx(this.tryWrap(module, account), 'Unable to wrap module as ModuleWrapper')
  }

  observe(payloads?: Payload[]): Promise<Payload[]> {
    const queryPayload = PayloadWrapper.parse<WitnessObserveQuery>({ schema: WitnessObserveQuerySchema })
    return this.sendQuery(queryPayload, [queryPayload.payload, ...(payloads ?? [])])
  }
}

/** @deprecated use WitnessWrapper instead */
export class XyoWitnessWrapper extends WitnessWrapper {}
