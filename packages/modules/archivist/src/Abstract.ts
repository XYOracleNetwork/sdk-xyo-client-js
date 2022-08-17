import { assertEx } from '@xylabs/sdk-js'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoAbstractModule } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { NullablePromisableArray, Promisable, PromisableArray } from '@xyo-network/promisable'

import { Archivist } from './Archivist'
import { XyoArchivist, XyoArchivistQueryPayload } from './XyoArchivist'
import { XyoArchivistConfig, XyoArchivistParents } from './XyoArchivistConfig'

export abstract class XyoAbstractArchivist<
    Q extends XyoArchivistQueryPayload = XyoArchivistQueryPayload,
    C extends XyoArchivistConfig = XyoArchivistConfig,
  >
  extends XyoAbstractModule<Q, C>
  implements XyoArchivist<XyoArchivistQueryPayload>, Archivist<XyoPayload, XyoPayload, XyoPayload, XyoPayload, XyoArchivistQueryPayload>
{
  abstract get(ids: string[]): NullablePromisableArray<XyoPayload<{ schema: string }>>

  abstract find(query: XyoArchivistQueryPayload<XyoPayload<{ schema: string }>>): PromisableArray<XyoPayload<{ schema: string }>>

  abstract insert(item: XyoPayload<{ schema: string }>[]): PromisableArray<XyoPayload<{ schema: string }>>

  abstract override query<Q>(query: Q): Promisable<[XyoBoundWitness, XyoPayload[]]>

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
