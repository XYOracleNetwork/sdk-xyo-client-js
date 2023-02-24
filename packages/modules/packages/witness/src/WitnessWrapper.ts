import { assertEx } from '@xylabs/assert'
import { Module, ModuleWrapper } from '@xyo-network/module'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { XyoWitnessObserveQuery, XyoWitnessObserveQuerySchema } from './Queries'
import { Witness } from './Witness'

export class WitnessWrapper extends ModuleWrapper implements Witness {
  static override requiredQueries = [XyoWitnessObserveQuerySchema, ...super.requiredQueries]

  static override tryWrap(module: Module): ModuleWrapper | undefined {
    const missingRequiredQueries = this.missingRequiredQueries(module)
    if (missingRequiredQueries.length > 0) {
      console.warn(`Missing queries: ${JSON.stringify(missingRequiredQueries, null, 2)}`)
    } else {
      return new ModuleWrapper(module as Module)
    }
  }

  static override wrap(module: Module): ModuleWrapper {
    return assertEx(this.tryWrap(module), 'Unable to wrap module as ModuleWrapper')
  }

  observe(payloads?: XyoPayload[]): Promise<XyoPayloads> {
    const queryPayload = PayloadWrapper.parse<XyoWitnessObserveQuery>({ schema: XyoWitnessObserveQuerySchema })
    return this.sendQuery(queryPayload, [queryPayload.payload, ...(payloads ?? [])])
  }
}

/** @deprecated use WitnessWrapper instead */
export class XyoWitnessWrapper extends WitnessWrapper {}
