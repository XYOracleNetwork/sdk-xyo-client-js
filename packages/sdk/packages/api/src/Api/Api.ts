import { AddressValue } from '@xyo-network/account'
import { XyoApiConfig } from '@xyo-network/api-models'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { DataLike } from '@xyo-network/core'
import { Huri } from '@xyo-network/huri'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload-model'

import { XyoApiSimple } from '../Simple'
import { XyoUserApi } from '../User'
import { XyoAccountApi } from './Account'
import { XyoArchivistArchiveApi } from './Archive'
import { XyoArchivistArchivesApi } from './Archives'
import { XyoArchivistNodeApi } from './Node'

export class XyoArchivistApi<C extends XyoApiConfig = XyoApiConfig> extends XyoApiSimple<XyoPayloads, C> {
  private _archives?: XyoArchivistArchivesApi
  private _stats?: XyoApiSimple<unknown[]>
  private _user?: XyoUserApi

  get archives(): XyoArchivistArchivesApi {
    this._archives =
      this._archives ??
      new XyoArchivistArchivesApi({
        ...this.config,
        root: `${this.root}archive/`,
      })
    return this._archives
  }

  /**
   * @deprecated Use module API
   */
  get stats() {
    this._stats =
      this._stats ??
      new XyoApiSimple<unknown[]>({
        ...this.config,
        root: `${this.root}stats/`,
      })
    return this._stats
  }

  get user(): XyoUserApi {
    this._user =
      this._user ??
      new XyoUserApi({
        ...this.config,
        root: `${this.root}user/`,
      })
    return this._user
  }

  account(address: DataLike) {
    return new XyoAccountApi({
      ...this.config,
      root: `${this.root}wallet/${new AddressValue(address).hex}/`,
    })
  }

  archive(archive = 'temp') {
    const pureArchive = archive.toLowerCase()
    return new XyoArchivistArchiveApi({
      ...this.config,
      root: `${this.root}archive/${pureArchive}/`,
    })
  }

  huri(huri: Huri | string) {
    const huriObj = typeof huri === 'string' ? new Huri(huri) : huri
    return new XyoApiSimple<XyoPayload>({
      ...this.config,
      root: `${this.root}${huriObj.href}/`,
    })
  }

  /**
   * Issues commands/queries as XyoBoundWitness wrapped XyoPayloads against a Node in the network
   * @deprecated Use module API
   * @param archive Optional, the archive to issue the requests against
   * @returns Confirmation for the request, as a BoundWitness, from the network Node
   */
  node<TData extends XyoBoundWitness | XyoBoundWitness[] = XyoBoundWitness | XyoBoundWitness[]>(archive = 'temp') {
    return new XyoArchivistNodeApi<TData>({
      ...this.config,
      root: `${this.root}${archive}/`,
    })
  }
}
