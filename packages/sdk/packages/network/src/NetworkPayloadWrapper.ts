import { PayloadBuilder } from '@xyo-network/payload-builder'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { knownNetworks } from './knownNetworks'
import { NetworkNodeType } from './NetworkNodePayload'
import { NetworkPayload } from './NetworkPayload'

export class NetworkPayloadWrapper extends PayloadWrapper<NetworkPayload> {
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

  static async known(hash: string): Promise<NetworkPayload | undefined> {
    return await PayloadBuilder.findByDataHash(await knownNetworks(), hash)
  }

  filterNodesByType(type: NetworkNodeType) {
    return this.payload.nodes?.filter((node) => node.type === type)
  }
}
