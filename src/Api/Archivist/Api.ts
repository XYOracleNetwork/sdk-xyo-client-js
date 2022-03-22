import { Huri } from '../../Huri'
import { XyoPayload } from '../../models'
import { XyoAuthApi } from '../Auth'
import { XyoApiBase } from '../Base'
import { XyoArchivistArchivesApi } from './Archives'
import { XyoArchivistDomainApi } from './Domain'

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

  private _domain?: XyoArchivistDomainApi
  public get domain(): XyoArchivistDomainApi {
    this._domain =
      this._domain ??
      new XyoArchivistDomainApi({
        ...this.config,
        root: `${this.root}domain/`,
      })
    return this._domain
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

  public async get(huri: Huri | string) {
    const huriObj = typeof huri === 'string' ? new Huri(huri) : huri
    return await this.getEndpoint<XyoPayload>(huriObj.href)
  }
}
