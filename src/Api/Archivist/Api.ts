import { XyoDomainConfig } from '../../DomainConfig'
import { Huri } from '../../Huri'
import { XyoPayload } from '../../models'
import { XyoAuthApi } from '../Auth'
import { XyoApiBase, XyoApiResponseTuple, XyoApiResponseType } from '../Base'
import { XyoApiSimple } from '../Simple'
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

  public domain(domain: string): XyoApiSimple<XyoDomainConfig> {
    return new XyoApiSimple<XyoDomainConfig>({
      ...this.config,
      root: `${this.root}domain/${domain}/`,
    })
  }

  private _user?: XyoAuthApi
  public get user(): XyoAuthApi {
    this._user =
      this._user ??
      new XyoAuthApi({
        ...this.config,
        root: `${this.root}user/`,
      })
    return this._user
  }

  public archive(archive = 'temp') {
    return new XyoArchivistArchiveApi({
      ...this.config,
      root: `${this.root}archive/${archive}/`,
    })
  }

  public huri(huri: Huri | string): XyoApiSimple<XyoPayload> {
    const huriObj = typeof huri === 'string' ? new Huri(huri) : huri
    return new XyoApiSimple<XyoPayload>({
      ...this.config,
      root: `${this.root}${huriObj.href}/`,
    })
  }

  /** @deprecated use huri(huri) instead */
  public async get(huri: Huri | string): Promise<XyoPayload>
  /** @deprecated use huri(huri) instead */
  public async get(huri: Huri | string, responseType?: 'body'): Promise<XyoPayload>
  /** @deprecated use huri(huri) instead */
  public async get(huri: Huri | string, responseType?: 'tuple'): Promise<XyoApiResponseTuple<XyoPayload>>
  /** @deprecated use huri(huri) instead */
  public async get(
    huri: Huri | string,
    responseType?: XyoApiResponseType
  ): Promise<XyoPayload | XyoApiResponseTuple<XyoPayload>> {
    const huriObj = typeof huri === 'string' ? new Huri(huri) : huri
    switch (responseType) {
      case 'tuple':
        return await this.getEndpoint(huriObj.href, 'tuple')
      default:
        return await this.getEndpoint(huriObj.href, 'body')
    }
  }
}
