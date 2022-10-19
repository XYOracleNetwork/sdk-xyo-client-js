import { assertEx } from '@xylabs/assert'
import { XyoAccount } from '@xyo-network/account'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
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

  public override async divine(payloads?: XyoPayloads): Promise<XyoBoundWitness[]> {
    if (!payloads) return []
    try {
      // TODO: Get from correct API endpoint
      const address = new XyoAccount({ phrase: 'test' }).addressValue.hex
      const bwResult = await this.api.addresses.address(address).boundWitnesses.get('tuple')
      const [, response, error] = bwResult
      if (error?.status >= 400) {
        throw new RemoteDivinerError('divine', `${error.statusText} [${error.status}]`)
      }
      if (response?.error?.length) {
        throw new RemoteDivinerError('divine', response?.error)
      }
      return bwResult?.[0] as XyoBoundWitness[]
    } catch (ex) {
      console.error(ex)
      throw ex
    }
  }
}
