import { assertEx } from '@xylabs/sdk-js'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoAbstractModule } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { NullablePromisableArray, Promisable, PromisableArray } from '@xyo-network/promisable'

import { Archivist } from './Archivist'
import { XyoArchivistQueryPayload } from './Query'
import { XyoArchivist } from './XyoArchivist'
import { XyoArchivistConfig, XyoArchivistParents } from './XyoArchivistConfig'
import { XyoPayloadFindFilter } from './XyoPayloadFindFilter'

export abstract class XyoAbstractArchivist<TConfig extends XyoPayload = XyoPayload>
  extends XyoAbstractModule<XyoArchivistQueryPayload, XyoArchivistConfig<TConfig>>
  implements XyoArchivist<XyoArchivistQueryPayload>, Archivist<XyoPayload, XyoPayload, XyoPayload, XyoPayload, XyoPayloadFindFilter>
{
  abstract get(hashes: string[]): NullablePromisableArray<XyoPayload>

  public all(): PromisableArray<XyoPayload> {
    throw Error('Not implemented')
  }

  public clear(): Promisable<void> {
    throw Error('Not implemented')
  }

  public commit(): PromisableArray<XyoPayload> {
    throw Error('Not implemented')
  }

  public delete(_hashes: string[]): PromisableArray<boolean> {
    throw Error('Not implemented')
  }

  abstract find(filter: XyoPayloadFindFilter): PromisableArray<XyoPayload>

  abstract insert(item: XyoPayload[]): PromisableArray<XyoPayload>

  async query(query: XyoArchivistQueryPayload): Promise<[XyoBoundWitness, (XyoPayload | null)[]]> {
    const payloads: (XyoPayload | null)[] = []
    switch (query.schema) {
      case 'network.xyo.query.archivist.all':
        payloads.concat(await this.all())
        break
      case 'network.xyo.query.archivist.clear':
        await this.clear()
        break
      case 'network.xyo.query.archivist.commit':
        payloads.concat(await this.commit())
        break
      case 'network.xyo.query.archivist.delete':
        await this.delete(query.hashes)
        break
      case 'network.xyo.query.archivist.find':
        payloads.concat(await this.find(query.filter))
        break
      case 'network.xyo.query.archivist.get':
        payloads.concat(await this.get(query.hashes))
        break
      case 'network.xyo.query.archivist.insert':
        payloads.concat(await this.insert(query.payloads))
        break
    }
    return [this.bindPayloads(payloads), payloads]
  }

  get resolver() {
    return this.config.resolver
  }

  private resolveArchivists(archivists?: Record<string, XyoArchivist | null | undefined>) {
    const resolved: Record<string, XyoArchivist | null | undefined> = {}
    if (archivists) {
      Object.entries(archivists).forEach(([key, value]) => {
        resolved[key] = value ?? this.resolver?.(key) ?? null
      })
    }
    return resolved
  }

  private _parents?: XyoArchivistParents
  get parents() {
    this._parents = this._parents ?? {
      commit: this.resolveArchivists(this.config.parents?.commit),
      read: this.resolveArchivists(this.config.parents?.commit),
      write: this.resolveArchivists(this.config.parents?.commit),
    }
    return assertEx(this._parents)
  }
}
