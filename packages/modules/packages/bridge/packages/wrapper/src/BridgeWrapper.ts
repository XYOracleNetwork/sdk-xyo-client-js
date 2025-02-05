import type { Address } from '@xylabs/hex'
import type {
  BridgeExposeOptions,
  BridgeExposeQuery,
  BridgeInstance,
  BridgeModule,
  BridgeUnexposeOptions,
  BridgeUnexposeQuery,
  ModuleFilterPayload,
} from '@xyo-network/bridge-model'
import {
  BridgeExposeQuerySchema,
  BridgeUnexposeQuerySchema,
  isBridgeInstance,
  isBridgeModule,
  ModuleFilterPayloadSchema,
} from '@xyo-network/bridge-model'
import type {
  AddressPayload, ModuleIdentifier, ModuleInstance,
} from '@xyo-network/module-model'
import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module-wrapper'

constructableModuleWrapper()
export class BridgeWrapper<TWrappedModule extends BridgeModule = BridgeModule>
  extends ModuleWrapper<TWrappedModule>
  implements BridgeInstance<TWrappedModule['params']> {
  static override readonly instanceIdentityCheck = isBridgeInstance
  static override readonly moduleIdentityCheck = isBridgeModule

  async expose(id: ModuleIdentifier, options?: BridgeExposeOptions): Promise<ModuleInstance[]> {
    const filterPayload: ModuleFilterPayload = {
      id, schema: ModuleFilterPayloadSchema, ...options,
    }
    const addresses = (
      await this.sendQuery<BridgeExposeQuery, ModuleFilterPayload, AddressPayload>({ schema: BridgeExposeQuerySchema }, [filterPayload])
    ).map(({ address }) => address)
    return await Promise.all((addresses as Address[]).map(address => this.resolve(address)))
  }

  async unexpose(id: ModuleIdentifier, options?: BridgeUnexposeOptions): Promise<Address[]> {
    const filterPayload: ModuleFilterPayload = {
      id, schema: ModuleFilterPayloadSchema, ...options,
    }
    return (
      await this.sendQuery<BridgeUnexposeQuery, ModuleFilterPayload, AddressPayload>({ schema: BridgeUnexposeQuerySchema }, [filterPayload])
    ).map(({ address }) => address)
  }
}
