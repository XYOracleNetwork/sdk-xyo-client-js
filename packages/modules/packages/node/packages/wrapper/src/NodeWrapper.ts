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
    const queryPayload = PayloadWrapper.parse({ external, nameOrAddress, schema: XyoNodeAttachQuerySchema }) as PayloadWrapper<XyoNodeAttachQuery>
    const payloads: AddressPayload[] = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.pop()?.address
  }

  async attached(): Promise<string[]> {
    const queryPayload = PayloadWrapper.parse({ schema: XyoNodeAttachedQuerySchema }) as PayloadWrapper<XyoNodeAttachedQuery>
    const payloads: AddressPayload[] = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.map((p) => p.address)
  }

  async detach(nameOrAddress: string): Promise<string | undefined> {
    const queryPayload = PayloadWrapper.parse({ nameOrAddress, schema: XyoNodeDetachQuerySchema }) as PayloadWrapper<XyoNodeDetachQuery>
    const payloads: AddressPayload[] = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.pop()?.address
  }

  async registered(): Promise<string[]> {
    const queryPayload = PayloadWrapper.parse({ schema: XyoNodeRegisteredQuerySchema }) as PayloadWrapper<XyoNodeRegisteredQuery>
    const payloads: AddressPayload[] = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.map((p) => p.address)
  }
}
