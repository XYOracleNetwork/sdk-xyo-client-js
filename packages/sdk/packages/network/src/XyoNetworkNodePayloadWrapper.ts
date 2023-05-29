import { assertEx } from '@xylabs/assert'
import { PayloadHasher } from '@xyo-network/core'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { knownArchivists } from './knownArchivists'
import { knownDiviners } from './knownDiviners'
import { XyoNetworkNodePayload } from './XyoNetworkNodePayload'

export class XyoNetworkNodePayloadWrapper<T extends XyoNetworkNodePayload = XyoNetworkNodePayload> extends PayloadWrapper<T> {
  static async known(hash: string) {
    const config = assertEx((await PayloadHasher.find(knownArchivists(), hash)) ?? (await PayloadHasher.find(knownDiviners(), hash)), 'Unknown node')
    return new XyoNetworkNodePayloadWrapper(config)
  }
}
