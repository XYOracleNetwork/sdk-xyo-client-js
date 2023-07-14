import { AccountInstance } from '@xyo-network/account-model'
import { ArchivistModuleEventData, ArchivistParams, DirectArchivistModule } from '@xyo-network/archivist-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { ModuleManifestPayload } from '@xyo-network/manifest-model'
import { AddressPreviousHashPayload, ModuleDescriptionPayload } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { Promisable, PromisableArray } from '@xyo-network/promise'

import { AbstractIndirectArchivist } from './AbstractIndirectArchivist'

export abstract class AbstractDirectArchivist<
    TParams extends ArchivistParams = ArchivistParams,
    TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
  >
  extends AbstractIndirectArchivist<TParams, TEventData>
  implements DirectArchivistModule<TParams>
{
  all(): PromisableArray<Payload> {
    return this.busy(async () => {
      return await this.allHandler()
    })
  }

  clear(): Promisable<void> {
    return this.busy(async () => {
      return await this.clearHandler()
    })
  }

  commit(): Promisable<BoundWitness[]> {
    return this.busy(async () => {
      return await this.commitHandler()
    })
  }

  delete(hashes: string[]): PromisableArray<boolean> {
    return this.busy(async () => {
      return await this.deleteHandler(hashes)
    })
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

  get(hashes: string[]): Promise<Payload[]> {
    return this.busy(async () => {
      return await this.getHandler(hashes)
    })
  }

  insert(payloads: Payload[]): PromisableArray<BoundWitness> {
    return this.busy(async () => {
      return await this.insertHandler(payloads)
    })
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
