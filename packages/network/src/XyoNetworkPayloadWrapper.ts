import { assertEx } from '@xylabs/sdk-js'
import { XyoPayloadWrapper } from '@xyo-network/core'

import { knownNetworks } from './knownNetworks'
import { XyoNetworkNodeType } from './XyoNetworkNodePayload'
import { XyoNetworkPayload } from './XyoNetworkPayload'

export class XyoNetworkPayloadWrapper extends XyoPayloadWrapper<XyoNetworkPayload> {
  public filterNodesByType(type: XyoNetworkNodeType) {
    return this.payload.nodes?.filter((node) => node.type === type)
  }

  public get archivists() {
    return this.filterNodesByType('archivist')
  }

  public get diviners() {
    return this.filterNodesByType('diviner')
  }

  public get bridges() {
    return this.filterNodesByType('bridge')
  }

  public get sentinels() {
    return this.filterNodesByType('sentinel')
  }

  static known(hash: string) {
    const payload = assertEx(
      knownNetworks().find((payload) => new XyoNetworkPayloadWrapper(payload).hash === hash),
      'Unknown network'
    )
    return new XyoNetworkPayloadWrapper(payload)
  }
}

/** @deprecated use XyoNetworkPayloadWrapper instead */
export const XyoNetworkConfigWrapper = XyoNetworkPayloadWrapper
