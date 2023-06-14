import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { constructableModuleWrapper, Module, ModuleWrapper } from '@xyo-network/module'
import {
  NodeAttachedQuery,
  NodeAttachedQuerySchema,
  NodeAttachQuery,
  NodeAttachQuerySchema,
  NodeDetachQuery,
  NodeDetachQuerySchema,
  NodeModule,
  NodeRegisteredQuery,
  NodeRegisteredQuerySchema,
} from '@xyo-network/node-model'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

constructableModuleWrapper()
export class NodeWrapper<TWrappedModule extends NodeModule = NodeModule> extends ModuleWrapper<TWrappedModule> {
  static override requiredQueries = [NodeAttachQuerySchema, ...ModuleWrapper.requiredQueries]

  static isNodeModule(module: Module) {
    const missingRequiredQueries = this.missingRequiredQueries(module)
    return missingRequiredQueries.length === 0
  }

  async attach(nameOrAddress: string, external?: boolean): Promise<string | undefined> {
    const queryPayload = PayloadWrapper.wrap<NodeAttachQuery>({ external, nameOrAddress, schema: NodeAttachQuerySchema })
    const payloads: AddressPayload[] = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.pop()?.address
  }

  async attached(): Promise<string[]> {
    const queryPayload = PayloadWrapper.wrap<NodeAttachedQuery>({ schema: NodeAttachedQuerySchema })
    const payloads: AddressPayload[] = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.map((p) => p.address)
  }

  async detach(nameOrAddress: string): Promise<string | undefined> {
    const queryPayload = PayloadWrapper.wrap<NodeDetachQuery>({ nameOrAddress, schema: NodeDetachQuerySchema })
    const payloads: AddressPayload[] = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.pop()?.address
  }

  async registered(): Promise<string[]> {
    const queryPayload = PayloadWrapper.wrap<NodeRegisteredQuery>({ schema: NodeRegisteredQuerySchema })
    const payloads: AddressPayload[] = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.map((p) => p.address)
  }
}
