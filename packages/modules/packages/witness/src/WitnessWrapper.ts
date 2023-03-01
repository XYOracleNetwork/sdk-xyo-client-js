import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { Module, ModuleWrapper } from '@xyo-network/module'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { XyoWitnessObserveQuery, XyoWitnessObserveQuerySchema } from './Queries'
import { Witness } from './Witness'

export class WitnessWrapper extends ModuleWrapper implements Witness {
  static override requiredQueries = [XyoWitnessObserveQuerySchema, ...super.requiredQueries]

  static override tryWrap(module?: Module, account?: Account): WitnessWrapper | undefined {
    if (module) {
      const missingRequiredQueries = this.missingRequiredQueries(module)
      if (missingRequiredQueries.length > 0) {
        console.warn(`Missing queries: ${JSON.stringify(missingRequiredQueries, null, 2)}`)
      } else {
        return new WitnessWrapper(module as Module, account)
      }
    }
  }

  static override wrap(module?: Module, account?: Account): WitnessWrapper {
    return assertEx(this.tryWrap(module, account), 'Unable to wrap module as ModuleWrapper')
  }

  observe(payloads?: XyoPayload[]): Promise<XyoPayloads> {
    const queryPayload = PayloadWrapper.parse<XyoWitnessObserveQuery>({ schema: XyoWitnessObserveQuerySchema })
    return this.sendQuery(queryPayload, [queryPayload.payload, ...(payloads ?? [])])
  }
}

/** @deprecated use WitnessWrapper instead */
export class XyoWitnessWrapper extends WitnessWrapper {}
