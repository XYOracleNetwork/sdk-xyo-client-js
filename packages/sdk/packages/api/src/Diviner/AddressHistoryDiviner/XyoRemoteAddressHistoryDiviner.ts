import { assertEx } from '@xylabs/assert'
import { XyoBoundWitness, XyoBoundWitnessSchema } from '@xyo-network/boundwitness'
import { AbstractDiviner, AddressHistoryDiviner, isAddressHistoryQueryPayload, XyoDivinerDivineQuerySchema } from '@xyo-network/diviner'
import { ModuleParams } from '@xyo-network/module'
import { XyoPayloads } from '@xyo-network/payload-model'

import { XyoArchivistApi } from '../../Api'
import { RemoteDivinerError } from '../RemoteDivinerError'
import { XyoRemoteDivinerConfig, XyoRemoteDivinerConfigSchema } from '../XyoRemoteDivinerConfig'

export type XyoRemoteAddressHistoryDivinerParams = ModuleParams<XyoRemoteDivinerConfig> & {
  api?: XyoArchivistApi
}

/** @description Diviner Context that connects to a remote Diviner using the API */
export class XyoRemoteAddressHistoryDiviner extends AbstractDiviner<XyoRemoteDivinerConfig> implements AddressHistoryDiviner {
  static override configSchema = XyoRemoteDivinerConfigSchema
  static override targetSchema = XyoBoundWitnessSchema

  protected _api?: XyoArchivistApi

  protected constructor(params: XyoRemoteAddressHistoryDivinerParams) {
    super(params)
    this._api = params?.api
  }

  public get api() {
    if (this._api) {
      return this._api
    }
    // eslint-disable-next-line deprecation/deprecation
    if (this.config?.api) {
      this.logger?.warn('api specified in config but should be specified in params')
      // eslint-disable-next-line deprecation/deprecation
      return this.config?.api
    }
    throw Error('No api specified')
  }

  static override async create(params?: XyoRemoteAddressHistoryDivinerParams) {
    return (await super.create(params)) as XyoRemoteAddressHistoryDiviner
  }

  public override async divine(payloads?: XyoPayloads): Promise<XyoBoundWitness[]> {
    if (!payloads) return []
    try {
      const query = payloads.find(isAddressHistoryQueryPayload)
      if (!query) return []
      const { address, limit, offset } = query
      const singleAddress = assertEx(Array.isArray(address) ? address[0] : address, 'At least one address required')
      const find: { limit?: number; offset?: string } = {}
      if (limit) find.limit = limit
      if (offset) find.offset = `${offset}`
      const [data, body, response] =
        Object.keys(find).length > 0
          ? await this.api.addresses.address(singleAddress).boundWitnesses.find(find, 'tuple')
          : await this.api.addresses.address(singleAddress).boundWitnesses.get('tuple')
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

  public override queries() {
    return [XyoDivinerDivineQuerySchema, ...super.queries()]
  }
}
