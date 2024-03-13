import { assertEx } from '@xylabs/assert'
import { AccountInstance } from '@xyo-network/account-model'
import { ModuleManifestPayload } from '@xyo-network/manifest-model'
import { AddressPreviousHashPayload, Module, ModuleDescriptionPayload, ModuleEventData, ModuleParams } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { AbstractModule } from './AbstractModule'

export abstract class AbstractModuleInstance<TParams extends ModuleParams = ModuleParams, TEventData extends ModuleEventData = ModuleEventData>
  extends AbstractModule<TParams, TEventData>
  implements Module<TParams, TEventData>
{
  constructor(privateConstructorKey: string, params: TParams, account: AccountInstance) {
    assertEx(AbstractModule.privateConstructorKey === privateConstructorKey, 'Use create function instead of constructor')
    // Clone params to prevent mutation of the incoming object
    const mutatedParams = { ...params } as TParams
    super(privateConstructorKey, mutatedParams, account)
    this.upResolver.add(this)
    this.downResolver.add(this)
  }

  describe(): Promise<ModuleDescriptionPayload> {
    this._checkDead()
    return this.busy(async () => {
      return await this.describeHandler()
    })
  }

  discover(): Promise<Payload[]> {
    this._checkDead()
    return this.busy(async () => {
      return await this.discoverHandler()
    })
  }

  manifest(maxDepth?: number, ignoreAddresses?: string[]): Promise<ModuleManifestPayload> {
    this._checkDead()
    return this.busy(async () => {
      return await this.manifestHandler(maxDepth, ignoreAddresses)
    })
  }

  moduleAddress(): Promise<AddressPreviousHashPayload[]> {
    this._checkDead()
    return this.busy(async () => {
      return await this.moduleAddressHandler()
    })
  }

  state() {
    this._checkDead()
    return this.busy(async () => {
      return await this.stateHandler()
    })
  }

  subscribe(_queryAccount?: AccountInstance) {
    this._checkDead()
    return this.subscribeHandler()
  }
}
