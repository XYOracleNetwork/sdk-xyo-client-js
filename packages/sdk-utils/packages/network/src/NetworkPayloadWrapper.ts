import { Hash } from '@xylabs/hex'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { knownNetworks } from './knownNetworks.ts'
import { NetworkNodeType } from './NetworkNodePayload.ts'
import { NetworkPayload } from './NetworkPayload.ts'

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

  static async known(hash: Hash): Promise<NetworkPayload | undefined> {
    return await PayloadBuilder.findByDataHash(await knownNetworks(), hash)
  }

  filterNodesByType(type: NetworkNodeType) {
    return this.payload.nodes?.filter((node) => node.type === type)
  }
}
