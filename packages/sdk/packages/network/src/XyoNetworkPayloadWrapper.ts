import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { knownNetworks } from './knownNetworks'
import { XyoNetworkNodeType } from './XyoNetworkNodePayload'
import { XyoNetworkPayload } from './XyoNetworkPayload'

export class XyoNetworkPayloadWrapper extends PayloadWrapper<XyoNetworkPayload> {
  get archivists() {
    return this.filterNodesByType('archivist')
  }

  get bridges() {
    return this.filterNodesByType('bridge')
  }

  get diviners() {
    return this.filterNodesByType('diviner')
  }

  get sentinels() {
    return this.filterNodesByType('sentinel')
  }

  static async known(hash: string): Promise<XyoNetworkPayload | undefined> {
    return await XyoNetworkPayloadWrapper.find(await knownNetworks(), hash)
  }

  filterNodesByType(type: XyoNetworkNodeType) {
    return this.payload.nodes?.filter((node) => node.type === type)
  }
}
