import { assertEx } from '@xylabs/assert'
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

  static known(hash: string) {
    const payload = assertEx(
      knownNetworks().find((payload) => new XyoNetworkPayloadWrapper(payload).hash === hash),
      'Unknown network',
    )
    return new XyoNetworkPayloadWrapper(payload)
  }

  filterNodesByType(type: XyoNetworkNodeType) {
    return this.payload.nodes?.filter((node) => node.type === type)
  }
}
