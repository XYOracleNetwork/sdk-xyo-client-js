import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { ModuleFilter, ModuleWrapper } from '@xyo-network/module'
import { isXyoPayloadOfSchemaType } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { Node, NodeModule } from './Node'
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

export class NodeWrapper<TModule extends NodeModule = NodeModule> extends ModuleWrapper<TModule> implements Node, NodeModule {
  public isModuleResolver = true

  private _archivist?: ArchivistWrapper

  public get archivist() {
    this._archivist = this._archivist ?? new ArchivistWrapper(this.module)
    return this._archivist
  }

  async attach(address: string, name?: string): Promise<void> {
    const queryPayload = PayloadWrapper.parse<XyoNodeAttachQuery>({ address, name, schema: XyoNodeAttachQuerySchema })
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

  resolve(filter?: ModuleFilter) {
    return this.module.resolve(filter)
  }
  tryResolve(filter?: ModuleFilter) {
    return this.module.tryResolve(filter)
  }
}
