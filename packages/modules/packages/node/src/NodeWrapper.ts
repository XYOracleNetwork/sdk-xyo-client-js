import { assertEx } from '@xylabs/assert'
import { AccountInstance } from '@xyo-network/account-model'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { ModuleWrapper } from '@xyo-network/module'
import { isXyoPayloadOfSchemaType } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { NodeModule } from './Node'
import {
  XyoNodeAttachedQuery,
  XyoNodeAttachedQuerySchema,
  XyoNodeAttachQuery,
  XyoNodeAttachQuerySchema,
  XyoNodeDetachQuery,
  XyoNodeDetachQuerySchema,
  XyoNodeRegisteredQuery,
  XyoNodeRegisteredQuerySchema,
} from './Queries'

export class NodeWrapper extends ModuleWrapper implements NodeModule {
  static override requiredQueries = [XyoNodeAttachQuerySchema, ...ModuleWrapper.requiredQueries]

  private _archivist?: ArchivistWrapper

  get archivist() {
    this._archivist = this._archivist ?? new ArchivistWrapper(this.module)
    return this._archivist
  }

  static override tryWrap<TModule extends NodeModule = NodeModule>(module?: TModule, account?: AccountInstance): NodeWrapper | undefined {
    if (module) {
      const missingRequiredQueries = this.missingRequiredQueries(module)
      if (missingRequiredQueries.length > 0) {
        console.warn(`Missing queries: ${JSON.stringify(missingRequiredQueries, null, 2)}`)
      } else {
        return new NodeWrapper(module as TModule, account)
      }
    }
  }

  static override wrap<TModule extends NodeModule = NodeModule>(module?: TModule, account?: AccountInstance): NodeWrapper {
    return assertEx(this.tryWrap(module, account), 'Unable to wrap module as NodeWrapper')
  }

  async attach(address: string, external?: boolean): Promise<void> {
    const queryPayload = PayloadWrapper.parse<XyoNodeAttachQuery>({ address, external, schema: XyoNodeAttachQuerySchema })
    await this.sendQuery(queryPayload)
  }

  async attached(): Promise<string[]> {
    const queryPayload = PayloadWrapper.parse<XyoNodeAttachedQuery>({ schema: XyoNodeAttachedQuerySchema })
    const payloads: AddressPayload[] = (await this.sendQuery(queryPayload)).filter(isXyoPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.map((p) => p.address)
  }

  async detach(address: string): Promise<void> {
    const queryPayload = PayloadWrapper.parse<XyoNodeDetachQuery>({ address, schema: XyoNodeDetachQuerySchema })
    await this.sendQuery(queryPayload)
  }

  async registered(): Promise<string[]> {
    const queryPayload = PayloadWrapper.parse<XyoNodeRegisteredQuery>({ schema: XyoNodeRegisteredQuerySchema })
    const payloads: AddressPayload[] = (await this.sendQuery(queryPayload)).filter(isXyoPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.map((p) => p.address)
  }
}
