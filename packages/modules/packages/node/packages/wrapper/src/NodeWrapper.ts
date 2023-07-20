import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { InstanceTypeCheck, Module, ModuleTypeCheck } from '@xyo-network/module-model'
import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module-wrapper'
import {
  isNodeInstance,
  isNodeModule,
  NodeAttachedQuery,
  NodeAttachedQuerySchema,
  NodeAttachQuery,
  NodeAttachQuerySchema,
  NodeDetachQuery,
  NodeDetachQuerySchema,
  NodeInstance,
  NodeModule,
  NodeRegisteredQuery,
  NodeRegisteredQuerySchema,
} from '@xyo-network/node-model'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

constructableModuleWrapper()
export class NodeWrapper<TWrappedModule extends NodeModule = NodeModule>
  extends ModuleWrapper<TWrappedModule>
  implements NodeInstance<TWrappedModule['params']>
{
  static override instanceIdentityCheck: InstanceTypeCheck = isNodeInstance
  static override moduleIdentityCheck = isNodeModule
  static override requiredQueries = [NodeAttachQuerySchema, ...ModuleWrapper.requiredQueries]

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

  register(_module: Module) {
    throw Error('Not implemented')
  }

  async registered(): Promise<string[]> {
    const queryPayload = PayloadWrapper.wrap<NodeRegisteredQuery>({ schema: NodeRegisteredQuerySchema })
    const payloads: AddressPayload[] = (await this.sendQuery(queryPayload)).filter(isPayloadOfSchemaType<AddressPayload>(AddressSchema))
    return payloads.map((p) => p.address)
  }
}
