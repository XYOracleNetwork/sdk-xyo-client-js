import { assertEx } from '@xylabs/sdk-js'

import { XyoPayload } from '../../../core'
import { XyoApiConfig } from '../../models'
import { objToQuery } from '../../objToQuery'
import { XyoApiSimple } from '../../Simple'
import { WithArchive } from '../../WithArchive'

export interface XyoPayloadFindFilter {
  order: 'desc' | 'asc'
  timestamp: number
  limit?: number
}

export interface XyoPayloadStats {
  count: number
}

export class XyoArchivistArchivePayloadApi<T extends XyoPayload = XyoPayload, C extends WithArchive<XyoApiConfig> = WithArchive<XyoApiConfig>> extends XyoApiSimple<T[], T[], C> {
  private _stats?: XyoApiSimple<XyoPayloadStats>
  public get stats(): XyoApiSimple<XyoPayloadStats> {
    this._stats =
      this._stats ??
      new XyoApiSimple<XyoPayloadStats>({
        ...this.config,
        root: `${this.root}stats/`,
      })
    return this._stats
  }

  public hash(hash: string): XyoApiSimple<XyoPayload[]> {
    return new XyoApiSimple<XyoPayload[]>({
      ...this.config,
      root: `${this.root}hash/${hash}/`,
    })
  }

  /** @deprecated use stats instead */
  public async getStats() {
    return await this.getEndpoint<XyoPayloadStats>('stats')
  }

  public async getByHash(hash: string) {
    return await this.getEndpoint<T[]>(`hash/${hash}`)
  }

  public async repairByHash(hash: string) {
    return await this.getEndpoint<T[]>(`hash/${hash}/repair`)
  }

  public async find({ order, timestamp, limit = 20 }: XyoPayloadFindFilter) {
    assertEx(limit > 0, 'min limit = 1')
    assertEx(limit <= 100, 'max limit = 100')

    return await this.getEndpoint<T[]>(objToQuery({ limit, order, timestamp }))
  }

  public async findBefore(timestamp: number, limit = 20) {
    return await this.find({ limit, order: 'desc', timestamp })
  }

  /** @deprecated use findBefore */
  public async getBefore(timestamp: number, limit = 20) {
    return await this.findBefore(timestamp, limit)
  }

  public async findAfter(timestamp: number, limit = 20) {
    return await this.find({ limit, order: 'asc', timestamp })
  }

  /** @deprecated use findAfter */
  public async getAfter(timestamp: number, limit = 20) {
    return await this.findAfter(timestamp, limit)
  }

  public async findMostRecent(limit = 20) {
    assertEx(limit > 0, 'min limit = 1')
    assertEx(limit <= 100, 'max limit = 100')
    return await this.getEndpoint<T[]>(`recent${objToQuery({ limit })}`)
  }

  /** @deprecated use findMostRecent */
  public async getMostRecent(limit = 20) {
    return await this.findMostRecent(limit)
  }

  public async findSample(size = 10) {
    return await this.getEndpoint<T[]>(`sample${objToQuery({ size })}`)
  }

  /** @deprecated use findSample */
  public async getSample(size = 10) {
    return await this.findSample(size)
  }
}
