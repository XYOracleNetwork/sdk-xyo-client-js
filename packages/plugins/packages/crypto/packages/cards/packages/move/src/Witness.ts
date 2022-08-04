import { XyoQueryPayload } from '@xyo-network/payload'
import { XyoQueryWitness } from '@xyo-network/witness'

import { XyoCryptoCardsMovePayload } from './Payload'

export class XyoCryptoCardsMoveWitness extends XyoQueryWitness<XyoCryptoCardsMovePayload, XyoQueryPayload> {
  override async observe(payload: XyoCryptoCardsMovePayload): Promise<XyoCryptoCardsMovePayload> {
    return await super.observe({
      ...payload,
      timestamp: Date.now(),
    })
  }
}
