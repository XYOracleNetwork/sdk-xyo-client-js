import { AccountInstance } from '@xyo-network/account-model'
import { DivinerInstance, DivinerModuleEventData, DivinerParams } from '@xyo-network/diviner-model'
import { ModuleManifestPayload } from '@xyo-network/manifest-model'
import { AddressPreviousHashPayload, ModuleDescriptionPayload } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { AbstractIndirectDiviner } from './AbstractIndirectDiviner'

export abstract class AbstractDirectDiviner<
    TParams extends DivinerParams = DivinerParams,
    TEventData extends DivinerModuleEventData = DivinerModuleEventData,
  >
  extends AbstractIndirectDiviner<TParams, TEventData>
  implements DivinerInstance<TParams>
{
  describe(): Promise<ModuleDescriptionPayload> {
    return this.busy(async () => {
      await this.started('throw')
      return await super.describeHandler()
    })
  }

  discover(): Promise<Payload[]> {
    return this.busy(async () => {
      await this.started('throw')
      return await super.discoverHandler()
    })
  }

  divine(payloads?: Payload[]): Promise<Payload[]> {
    return this.busy(async () => {
      await this.started('throw')
      return await this.divineHandler(payloads)
    })
  }

  override async loadAccount() {
    const account = await super.loadAccount()
    this.downResolver.add(this)
    return account
  }

  manifest(): Promise<ModuleManifestPayload> {
    return this.busy(async () => {
      await this.started('throw')
      return await super.manifestHandler()
    })
  }

  moduleAddress(): Promise<AddressPreviousHashPayload[]> {
    return this.busy(async () => {
      await this.started('throw')
      return await super.moduleAddressHandler()
    })
  }

  subscribe(_queryAccount?: AccountInstance) {
    return super.subscribeHandler()
  }
}
