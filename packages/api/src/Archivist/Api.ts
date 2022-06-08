import { Huri, XyoAddressValue, XyoBoundWitness, XyoDataLike, XyoPayload } from '@xyo-network/core'

import { XyoApiBase } from '../Base'
import { XyoApiResponseBody, XyoApiResponseTuple, XyoApiResponseTupleOrBody, XyoApiResponseType } from '../models'
import { XyoApiSimple } from '../Simple'
import { XyoUserApi } from '../User'
import { XyoAccountApi } from './Account'
import { XyoArchivistArchiveApi } from './Archive'
import { XyoArchivistArchivesApi } from './Archives'

export class XyoArchivistApi extends XyoApiBase {
  private _archives?: XyoArchivistArchivesApi
  public get archives(): XyoArchivistArchivesApi {
    this._archives =
      this._archives ??
      new XyoArchivistArchivesApi({
        ...this.config,
        root: `${this.root}archive/`,
      })
    return this._archives
  }

  private _stats?: XyoApiSimple<unknown[]>
  public get stats() {
    this._stats =
      this._stats ??
      new XyoApiSimple<unknown[]>({
        ...this.config,
        root: `${this.root}stats/`,
      })
    return this._stats
  }

  private _user?: XyoUserApi
  public get user(): XyoUserApi {
    this._user =
      this._user ??
      new XyoUserApi({
        ...this.config,
        root: `${this.root}user/`,
      })
    return this._user
  }

  public archive(archive = 'temp') {
    const pureArchive = archive.toLowerCase()
    return new XyoArchivistArchiveApi({
      ...this.config,
      root: `${this.root}archive/${pureArchive}/`,
    })
  }

  /** @deprecated use account instead */
  public wallet(address: XyoDataLike) {
    return this.account(address)
  }

  public account(address: XyoDataLike) {
    return new XyoAccountApi({
      ...this.config,
      root: `${this.root}wallet/${new XyoAddressValue(address).hex}/`,
    })
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
  public node<TResponse extends string[][], TData extends XyoBoundWitness | XyoBoundWitness[] = XyoBoundWitness | XyoBoundWitness[]>(archive?: string) {
    return new XyoApiSimple<TResponse, TData>({
      ...this.config,
      root: archive ? `${this.root}${archive}/` : this.root,
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
}
