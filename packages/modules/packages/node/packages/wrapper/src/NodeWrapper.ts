import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { Module } from '@xyo-network/module-model'
import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module-wrapper'
import {
  DirectNodeModule,
  isNodeInstance,
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
export class NodeWrapper<TWrappedModule extends NodeModule = NodeModule> extends ModuleWrapper<TWrappedModule> implements DirectNodeModule {
  static override requiredQueries = [NodeAttachQuerySchema, ...ModuleWrapper.requiredQueries]

  async attach(nameOrAddress: string, external?: boolean): Promise<string | undefined> {
    if (isNodeInstance(this.module)) {
      return await this.module.attach(nameOrAddress, external)
    }
    const queryPayload = PayloadWrapper.wrap<NodeAttachQuery>({ external, nameOrAddress, schema: NodeAttachQuerySchema })
    const payloads: AddressPayload[] = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.pop()?.address
  }

  async attached(): Promise<string[]> {
    if (isNodeInstance(this.module)) {
      return await this.module.attached()
    }
    const queryPayload = PayloadWrapper.wrap<NodeAttachedQuery>({ schema: NodeAttachedQuerySchema })
    const payloads: AddressPayload[] = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.map((p) => p.address)
  }

  async detach(nameOrAddress: string): Promise<string | undefined> {
    if (isNodeInstance(this.module)) {
      return await this.module.detach(nameOrAddress)
    }
    const queryPayload = PayloadWrapper.wrap<NodeDetachQuery>({ nameOrAddress, schema: NodeDetachQuerySchema })
    const payloads: AddressPayload[] = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.pop()?.address
  }

  register(_module: Module) {
    throw Error('Not implemented')
  }

  async registered(): Promise<string[]> {
    if (isNodeInstance(this.module)) {
      return await this.module.registered()
    }
    const queryPayload = PayloadWrapper.wrap<NodeRegisteredQuery>({ schema: NodeRegisteredQuerySchema })
    const payloads: AddressPayload[] = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.map((p) => p.address)
  }
}
