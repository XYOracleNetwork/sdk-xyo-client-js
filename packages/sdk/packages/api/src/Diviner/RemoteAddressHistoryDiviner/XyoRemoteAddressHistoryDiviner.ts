import { assertEx } from '@xylabs/assert'
import { XyoDiviner, XyoDivinerDivineQuerySchema } from '@xyo-network/diviner'
import { XyoPayloads } from '@xyo-network/payload'

import { RemoteDivinerError } from '../RemoteDivinerError'
import { XyoRemoteDivinerConfig } from '../XyoRemoteDivinerConfig'

/** @description Diviner Context that connects to a remote Diviner using the API */
export class XyoRemoteAddressHistoryDiviner extends XyoDiviner<XyoRemoteDivinerConfig> {
  public get api() {
    return assertEx(this.config?.api, 'API not defined')
  }

  public override queries() {
    return [XyoDivinerDivineQuerySchema, ...super.queries()]
  }

  public override async divine(payloads?: XyoPayloads): Promise<XyoPayloads> {
    if (!payloads) return []
    try {
      // TODO: Get from correct API endpoint
      const bwResult = await this.api.archive('temp').block.post([], 'tuple')
      const [, response, error] = bwResult
      if (error?.status >= 400) {
        throw new RemoteDivinerError('divine', `${error.statusText} [${error.status}]`)
      }
      if (response?.error?.length) {
        throw new RemoteDivinerError('divine', response?.error)
      }
      throw new Error('')
    } catch (ex) {
      console.error(ex)
      throw ex
    }
  }
}
