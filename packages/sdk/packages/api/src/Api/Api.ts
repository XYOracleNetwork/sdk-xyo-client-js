import { XyoAddressValue } from '@xyo-network/account'
import { XyoApiResponseBody, XyoApiResponseTuple, XyoApiResponseTupleOrBody, XyoApiResponseType } from '@xyo-network/api-models'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoDataLike } from '@xyo-network/core'
import { Huri, XyoPayload } from '@xyo-network/payload'

import { XyoApiBase } from '../Base'
import { XyoApiSimple } from '../Simple'
import { XyoUserApi } from '../User'
import { XyoAccountApi } from './Account'
import { XyoAddressesApi } from './Addresses'
import { XyoArchivistArchiveApi } from './Archive'
import { XyoArchivistArchivesApi } from './Archives'
import { XyoArchivistNodeApi } from './Node'

export class XyoArchivistApi extends XyoApiBase {
  private _addresses?: XyoAddressesApi
  private _archives?: XyoArchivistArchivesApi
  private _stats?: XyoApiSimple<unknown[]>
  private _user?: XyoUserApi

  public get addresses(): XyoAddressesApi {
    this._addresses =
      this._addresses ??
      new XyoAddressesApi({
        ...this.config,
        root: `${this.root}address/`,
      })
    return this._addresses
  }

  public get archives(): XyoArchivistArchivesApi {
    this._archives =
      this._archives ??
      new XyoArchivistArchivesApi({
        ...this.config,
        root: `${this.root}archive/`,
      })
    return this._archives
  }

  public get stats() {
    this._stats =
      this._stats ??
      new XyoApiSimple<unknown[]>({
        ...this.config,
        root: `${this.root}stats/`,
      })
    return this._stats
  }

  public get user(): XyoUserApi {
    this._user =
      this._user ??
      new XyoUserApi({
        ...this.config,
        root: `${this.root}user/`,
      })
    return this._user
  }

  public account(address: XyoDataLike) {
    return new XyoAccountApi({
      ...this.config,
      root: `${this.root}wallet/${new XyoAddressValue(address).hex}/`,
    })
  }

  public archive(archive = 'temp') {
    const pureArchive = archive.toLowerCase()
    return new XyoArchivistArchiveApi({
      ...this.config,
      root: `${this.root}archive/${pureArchive}/`,
    })
  }

  /** @deprecated use huri(huri) instead */
  public async get(huri: Huri | string): Promise<XyoApiResponseBody<XyoPayload>>
  /** @deprecated use huri(huri) instead */
  public async get(huri: Huri | string, responseType?: 'body'): Promise<XyoApiResponseBody<XyoPayload>>
  /** @deprecated use huri(huri) instead */
  public async get(huri: Huri | string, responseType?: 'tuple'): Promise<XyoApiResponseTuple<XyoPayload>>
  /** @deprecated use huri(huri) instead */
  public async get(huri: Huri | string, responseType?: XyoApiResponseType): Promise<XyoApiResponseTupleOrBody<XyoPayload>> {
    const huriObj = typeof huri === 'string' ? new Huri(huri) : huri
    switch (responseType) {
      case 'tuple':
        return await this.getEndpoint(huriObj.href, 'tuple')
      default:
        return await this.getEndpoint(huriObj.href, 'body')
    }
  }

  public huri(huri: Huri | string) {
    const huriObj = typeof huri === 'string' ? new Huri(huri) : huri
    return new XyoApiSimple<XyoPayload>({
      ...this.config,
      root: `${this.root}${huriObj.href}/`,
    })
  }

  /**
   * Issues commands/queries as XyoBoundWitness wrapped XyoPayloads against a Node in the network
   * @param archive Optional, the archive to issue the requests against
   * @returns Confirmation for the request, as a BoundWitness, from the network Node
   */
  public node<TData extends XyoBoundWitness | XyoBoundWitness[] = XyoBoundWitness | XyoBoundWitness[]>(archive = 'temp') {
    return new XyoArchivistNodeApi<TData>({
      ...this.config,
      root: `${this.root}${archive}/`,
    })
  }

  /** @deprecated use account instead */
  public wallet(address: XyoDataLike) {
    return this.account(address)
  }
}
