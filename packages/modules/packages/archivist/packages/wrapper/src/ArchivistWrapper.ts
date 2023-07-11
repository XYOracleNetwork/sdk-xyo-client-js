import { assertEx } from '@xylabs/assert'
import { ArchivistGetQuerySchema, ArchivistModule, isArchivistInstance } from '@xyo-network/archivist-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { constructableModuleWrapper } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'

import { IndirectArchivistWrapper } from './IndirectArchivistWrapper'

constructableModuleWrapper()
export class ArchivistWrapper<TWrappedModule extends ArchivistModule = ArchivistModule>
  extends IndirectArchivistWrapper<TWrappedModule>
  implements ArchivistModule<TWrappedModule['params']>
{
  static override requiredQueries = [ArchivistGetQuerySchema, ...super.requiredQueries]

  override async all(): Promise<Payload[]> {
    if (isArchivistInstance(this.module)) {
      assertEx(this.module.all, 'Archivist does not support all')
      return (await this.module.all?.()) ?? []
    }
    return await super.all()
  }

  override async clear(): Promise<void> {
    if (isArchivistInstance(this.module)) {
      assertEx(this.module.clear, 'Archivist does not support clear')
      return await this.module.clear?.()
    }
    return await super.clear()
  }

  override async commit(): Promise<BoundWitness[]> {
    if (isArchivistInstance(this.module)) {
      assertEx(this.module.commit, 'Archivist does not support commit')
      return (await this.module.commit?.()) ?? []
    }
    return await super.commit()
  }

  override async delete(hashes: string[]): Promise<boolean[]> {
    if (isArchivistInstance(this.module)) {
      assertEx(this.module.delete, 'Archivist does not support delete')
      return (await this.module.delete?.(hashes)) ?? []
    }
    return await super.delete(hashes)
  }

  override async get(hashes: string[]): Promise<(Payload | null)[]> {
    if (isArchivistInstance(this.module)) {
      return await this.module.get(hashes)
    }
    return await super.get(hashes)
  }

  override async insert(payloads: Payload[]): Promise<BoundWitness[]> {
    if (isArchivistInstance(this.module)) {
      assertEx(this.module.insert, 'Archivist does not support insert')
      return await this.module.insert(payloads)
    }
    return await super.insert(payloads)
  }
}
