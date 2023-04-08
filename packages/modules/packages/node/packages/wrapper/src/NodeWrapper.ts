import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { constructableModuleWrapper, Module, ModuleWrapper } from '@xyo-network/module'
import {
  NodeModule,
  XyoNodeAttachedQuery,
  XyoNodeAttachedQuerySchema,
  XyoNodeAttachQuery,
  XyoNodeAttachQuerySchema,
  XyoNodeDetachQuery,
  XyoNodeDetachQuerySchema,
  XyoNodeRegisteredQuery,
  XyoNodeRegisteredQuerySchema,
} from '@xyo-network/node-model'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

constructableModuleWrapper()
export class NodeWrapper<TWrappedModule extends NodeModule = NodeModule> extends ModuleWrapper<TWrappedModule> {
  static override requiredQueries = [XyoNodeAttachQuerySchema, ...ModuleWrapper.requiredQueries]

  static isNodeModule(module: Module) {
    const missingRequiredQueries = this.missingRequiredQueries(module)
    return missingRequiredQueries.length === 0
  }

  async attach(nameOrAddress: string, external?: boolean): Promise<string | undefined> {
    const queryPayload = PayloadWrapper.parse<XyoNodeAttachQuery>({ external, nameOrAddress, schema: XyoNodeAttachQuerySchema })
    const payloads: AddressPayload[] = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.pop()?.address
  }

  async attached(): Promise<string[]> {
    const queryPayload = PayloadWrapper.parse<XyoNodeAttachedQuery>({ schema: XyoNodeAttachedQuerySchema })
    const payloads: AddressPayload[] = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.map((p) => p.address)
  }

  async detach(nameOrAddress: string): Promise<string | undefined> {
    const queryPayload = PayloadWrapper.parse<XyoNodeDetachQuery>({ nameOrAddress, schema: XyoNodeDetachQuerySchema })
    const payloads: AddressPayload[] = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.pop()?.address
  }

  async registered(): Promise<string[]> {
    const queryPayload = PayloadWrapper.parse<XyoNodeRegisteredQuery>({ schema: XyoNodeRegisteredQuerySchema })
    const payloads: AddressPayload[] = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.map((p) => p.address)
  }
}
