import { assertEx } from '@xylabs/assert'
import { AccountInstance } from '@xyo-network/account-model'
import { ModuleManifestPayload } from '@xyo-network/manifest-model'
import { AddressPreviousHashPayload, Module, ModuleDescriptionPayload, ModuleEventData, ModuleParams } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { AbstractIndirectModule } from './AbstractIndirectModule'

export abstract class AbstractModule<TParams extends ModuleParams = ModuleParams, TEventData extends ModuleEventData = ModuleEventData>
  extends AbstractIndirectModule<TParams, TEventData>
  implements Module<TParams, TEventData>
{
  constructor(privateConstructorKey: string, params: TParams) {
    assertEx(AbstractModule.privateConstructorKey === privateConstructorKey, 'Use create function instead of constructor')
    // Clone params to prevent mutation of the incoming object
    const mutatedParams = { ...params } as TParams
    super(privateConstructorKey, mutatedParams)
  }

  /* make it public */
  override async addressPreviousHash(): Promise<AddressPreviousHashPayload> {
    return await super.addressPreviousHash()
  }

  /* make it public */
  override async describe(): Promise<ModuleDescriptionPayload> {
    return await super.describe()
  }

  /* make it public */
  override async discover(): Promise<Payload[]> {
    return await super.discover()
  }

  /* make it public */
  override async manifest(): Promise<ModuleManifestPayload> {
    return await super.manifest()
  }

  /* make it public */
  override subscribe(_queryAccount?: AccountInstance) {
    return super.subscribe()
  }
}
