import { assertEx } from '@xylabs/assert'
import { PayloadWrapper } from '@xyo-network/payload'

import { knownNetworks } from './knownNetworks'
import { XyoNetworkNodeType } from './XyoNetworkNodePayload'
import { XyoNetworkPayload } from './XyoNetworkPayload'

export class XyoNetworkPayloadWrapper extends PayloadWrapper<XyoNetworkPayload> {
  public get archivists() {
    return this.filterNodesByType('archivist')
  }

  public get bridges() {
    return this.filterNodesByType('bridge')
  }

  public get diviners() {
    return this.filterNodesByType('diviner')
  }

  public get sentinels() {
    return this.filterNodesByType('sentinel')
  }

  static known(hash: string) {
    const payload = assertEx(
      knownNetworks().find((payload) => new XyoNetworkPayloadWrapper(payload).hash === hash),
      'Unknown network',
    )
    return new XyoNetworkPayloadWrapper(payload)
  }

  public filterNodesByType(type: XyoNetworkNodeType) {
    return this.payload.nodes?.filter((node) => node.type === type)
  }
}
