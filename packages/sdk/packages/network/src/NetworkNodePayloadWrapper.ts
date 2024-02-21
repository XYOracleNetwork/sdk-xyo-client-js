import { assertEx } from '@xylabs/assert'
import { Hash } from '@xylabs/hex'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { knownArchivists } from './knownArchivists'
import { knownDiviners } from './knownDiviners'
import { NetworkNodePayload } from './NetworkNodePayload'

export class NetworkNodePayloadWrapper<T extends NetworkNodePayload = NetworkNodePayload> extends PayloadWrapper<T> {
  static async known(hash: Hash) {
    const config = assertEx(
      (await PayloadBuilder.findByDataHash(knownArchivists(), hash)) ?? (await PayloadBuilder.findByDataHash(knownDiviners(), hash)),
      'Unknown node',
    )
    return new NetworkNodePayloadWrapper(config)
  }
}
