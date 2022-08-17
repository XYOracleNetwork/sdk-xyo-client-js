import { assertEx } from '@xylabs/sdk-js'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoAbstractModule } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { NullablePromisableArray, Promisable, PromisableArray } from '@xyo-network/promisable'
import compact from 'lodash/compact'

import { Archivist } from './Archivist'
import { XyoArchivist, XyoArchivistQueryPayload } from './XyoArchivist'
import { XyoArchivistConfig, XyoResolvedArchivistParents } from './XyoArchivistConfig'

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

  private _parents?: XyoResolvedArchivistParents
  get parents() {
    this._parents = this._parents ?? {
      commit: compact(this.config.parents?.commit?.map((parent) => this.resolver?.(parent))),
      read: compact(this.config.parents?.read?.map((parent) => this.resolver?.(parent))),
      write: compact(this.config.parents?.write?.map((parent) => this.resolver?.(parent))),
    }
    return assertEx(this._parents)
  }
}
