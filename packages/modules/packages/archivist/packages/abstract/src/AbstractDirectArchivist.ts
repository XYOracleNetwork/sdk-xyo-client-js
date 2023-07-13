import { ArchivistModuleEventData, ArchivistParams, DirectArchivistModule } from '@xyo-network/archivist-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { ModuleDescriptionPayload } from '@xyo-network/module-model'
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
    return this.allHandler()
  }

  clear(): Promisable<void> {
    return this.clearHandler()
  }

  commit(): Promisable<BoundWitness[]> {
    return this.commitHandler()
  }

  delete(hashes: string[]): PromisableArray<boolean> {
    return this.deleteHandler(hashes)
  }

  override describe(): Promise<ModuleDescriptionPayload> {
    return super.describe()
  }

  override async discover(): Promise<Payload[]> {
    return await super.discover()
  }

  get(hashes: string[]): Promise<Payload[]> {
    return this.getHandler(hashes)
  }

  insert(payloads: Payload[]): PromisableArray<BoundWitness> {
    return this.insertHandler(payloads)
  }
}
