import { assertEx } from '@xylabs/assert'
import { PayloadHasher } from '@xyo-network/hash'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { knownArchivists } from './knownArchivists'
import { knownDiviners } from './knownDiviners'
import { NetworkNodePayload } from './NetworkNodePayload'

export class NetworkNodePayloadWrapper<T extends NetworkNodePayload = NetworkNodePayload> extends PayloadWrapper<T> {
  static async known(hash: string) {
    const config = assertEx((await PayloadHasher.find(knownArchivists(), hash)) ?? (await PayloadHasher.find(knownDiviners(), hash)), 'Unknown node')
    return new NetworkNodePayloadWrapper(config)
  }
}
