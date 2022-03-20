import { Huri } from '../../Huri'
import { XyoPayload } from '../../models'
import { XyoArchivistArchivesApi } from './Archives'
import { XyoArchivistApiBase } from './Base'
import { XyoArchivistDomainApi } from './Domain'

class XyoArchivistApi extends XyoArchivistApiBase {
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

  public async get(huri: Huri | string) {
    const huriObj = typeof huri === 'string' ? new Huri(huri) : huri
    return await this.getEndpoint<XyoPayload>(huriObj.href)
  }
}

export { XyoArchivistApi }
