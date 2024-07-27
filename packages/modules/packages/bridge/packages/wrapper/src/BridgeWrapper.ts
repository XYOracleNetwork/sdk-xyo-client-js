import { Address } from '@xylabs/hex'
import {
  BridgeExposeOptions,
  BridgeExposeQuery,
  BridgeExposeQuerySchema,
  BridgeInstance,
  BridgeModule,
  BridgeUnexposeOptions,
  BridgeUnexposeQuery,
  BridgeUnexposeQuerySchema,
  isBridgeInstance,
  isBridgeModule,
  ModuleFilterPayload,
  ModuleFilterPayloadSchema,
} from '@xyo-network/bridge-model'
import { AddressPayload, ModuleIdentifier, ModuleInstance } from '@xyo-network/module-model'
import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module-wrapper'

constructableModuleWrapper()
export class BridgeWrapper<TWrappedModule extends BridgeModule = BridgeModule>
  extends ModuleWrapper<TWrappedModule>
  implements BridgeInstance<TWrappedModule['params']>
{
  static override instanceIdentityCheck = isBridgeInstance
  static override moduleIdentityCheck = isBridgeModule

  async expose(id: ModuleIdentifier, options?: BridgeExposeOptions): Promise<ModuleInstance[]> {
    const filterPayload: ModuleFilterPayload = { id, schema: ModuleFilterPayloadSchema, ...options }
    const addresses = (
      await this.sendQuery<BridgeExposeQuery, ModuleFilterPayload, AddressPayload>({ schema: BridgeExposeQuerySchema }, [filterPayload])
    ).map(({ address }) => address)
    return await Promise.all((addresses as Address[]).map((address) => this.resolve(address)))
  }

  async unexpose(id: ModuleIdentifier, options?: BridgeUnexposeOptions): Promise<Address[]> {
    const filterPayload: ModuleFilterPayload = { id, schema: ModuleFilterPayloadSchema, ...options }
    return (
      await this.sendQuery<BridgeUnexposeQuery, ModuleFilterPayload, AddressPayload>({ schema: BridgeUnexposeQuerySchema }, [filterPayload])
    ).map(({ address }) => address)
  }
}
