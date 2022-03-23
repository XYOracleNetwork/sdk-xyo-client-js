import { assertEx } from '@xylabs/sdk-js'

import { XyoPayload } from '../../../models'
import { XyoApiBase } from '../../Base'
import { XyoApiConfig } from '../../Config'
import { WithArchive } from '../../WithArchive'

const objToQuery = (obj: Record<string, string | number>) => {
  return `?${Object.entries(obj)
    .map(([key, value]) => {
      return `${key}=${value}`
    })
    .join('&')}`
}

export class XyoArchivistArchivePayloadApi<
  C extends WithArchive<XyoApiConfig> = WithArchive<XyoApiConfig>,
  T extends XyoPayload = XyoPayload
> extends XyoApiBase<C> {
  public async getStats() {
    return await this.getEndpoint<{ count: number }>('stats')
  }

  public async getByHash(hash: string) {
    return await this.getEndpoint<T[]>(`hash/${hash}`)
  }

  public async repairByHash(hash: string) {
    return await this.getEndpoint<T[]>(`hash/${hash}/repair`)
  }

  private async get({ order, timestamp, limit = 20 }: { order: 'desc' | 'asc'; timestamp: number; limit?: number }) {
    assertEx(limit > 0, 'min limit = 1')
    assertEx(limit <= 100, 'max limit = 100')

    return await this.getEndpoint<T[]>(objToQuery({ limit, order, timestamp }))
  }

  public async getBefore(timestamp: number, limit = 20) {
    return await this.get({ limit, order: 'desc', timestamp })
  }

  public async getAfter(timestamp: number, limit = 20) {
    return await this.get({ limit, order: 'asc', timestamp })
  }

  public async getMostRecent(limit = 20) {
    assertEx(limit > 0, 'min limit = 1')
    assertEx(limit <= 100, 'max limit = 100')
    return await this.getEndpoint<T[]>(`recent/${limit}`)
  }

  public async getSample(size: number) {
    return await this.getEndpoint<T[]>(`sample/${size}`)
  }
}
