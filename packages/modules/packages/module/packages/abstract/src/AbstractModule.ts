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

  describe(): Promise<ModuleDescriptionPayload> {
    return this.busy(async () => {
      return await super.describeHandler()
    })
  }

  discover(): Promise<Payload[]> {
    return this.busy(async () => {
      return await super.discoverHandler()
    })
  }

  override async loadAccount() {
    const account = await super.loadAccount()
    this.downResolver.add(this)
    return account
  }

  manifest(): Promise<ModuleManifestPayload> {
    return this.busy(async () => {
      return await super.manifestHandler()
    })
  }

  moduleAddress(): Promise<AddressPreviousHashPayload[]> {
    return this.busy(async () => {
      return await super.moduleAddressHandler()
    })
  }

  subscribe(_queryAccount?: AccountInstance) {
    return super.subscribeHandler()
  }
}
