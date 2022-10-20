import { assertEx } from '@xylabs/assert'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoDiviner, XyoDivinerDivineQuerySchema } from '@xyo-network/diviner'
import { XyoPayloads } from '@xyo-network/payload'

import { RemoteDivinerError } from '../RemoteDivinerError'
import { XyoRemoteDivinerConfig } from '../XyoRemoteDivinerConfig'
import { AddressHistoryDiviner, isAddressHistoryQueryPayload } from './AddressHistoryDiviner'

/** @description Diviner Context that connects to a remote Diviner using the API */
export class XyoRemoteAddressHistoryDiviner extends XyoDiviner<XyoRemoteDivinerConfig> implements AddressHistoryDiviner {
  public get api() {
    return assertEx(this.config?.api, 'API not defined')
  }

  public override queries() {
    return [XyoDivinerDivineQuerySchema, ...super.queries()]
  }

  public override async divine(payloads?: XyoPayloads): Promise<XyoBoundWitness[]> {
    if (!payloads) return []
    try {
      const query = payloads.find(isAddressHistoryQueryPayload)
      if (!query) return []
      const { address, limit, offset } = query
      const find: { limit?: number; offset?: string } = {}
      if (limit) find.limit = limit
      if (offset) find.offset = offset as string
      const [data, body, response] =
        Object.keys(find).length > 0
          ? await this.api.addresses.address(address).boundWitnesses.find(find, 'tuple')
          : await this.api.addresses.address(address).boundWitnesses.get('tuple')
      if (response?.status >= 400) {
        throw new RemoteDivinerError('divine', `${response.statusText} [${response.status}]`)
      }
      if (body?.error?.length) {
        throw new RemoteDivinerError('divine', body?.error)
      }
      return data || []
    } catch (ex) {
      console.error(ex)
      throw ex
    }
  }
}
