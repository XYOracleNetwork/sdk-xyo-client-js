import { XyoApiConfig } from '@xyo-network/api-models'
import { PayloadFindFilter, XyoPayload } from '@xyo-network/payload-model'

import { XyoApiSimple } from '../../Simple'
import { WithArchive } from '../../WithArchive'

export interface XyoPayloadStats {
  count: number
}

export class XyoArchivistPayloadApi<
  T extends XyoPayload = XyoPayload,
  C extends WithArchive<XyoApiConfig> = WithArchive<XyoApiConfig>,
> extends XyoApiSimple<T[], T[], PayloadFindFilter, C> {
  private _stats?: XyoApiSimple<XyoPayloadStats>

  /**
   * @deprecated Use module API
   */
  get stats(): XyoApiSimple<XyoPayloadStats> {
    this._stats =
      this._stats ??
      new XyoApiSimple<XyoPayloadStats>({
        ...this.config,
        root: `${this.root}stats/`,
      })
    return this._stats
  }

  /**
   * @deprecated Use module API
   */
  hash(hash: string): XyoApiSimple<XyoPayload[]> {
    return new XyoApiSimple<XyoPayload[]>({
      ...this.config,
      root: `${this.root}hash/${hash}/`,
    })
  }

  /**
   * @deprecated Use module API
   */
  async repair(hash: string) {
    return await this.getEndpoint<T[]>(`hash/${hash}/repair`)
  }
}
