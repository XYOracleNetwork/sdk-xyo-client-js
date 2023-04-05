import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoCryptoCardsMovePayload } from './Payload'
import { XyoCryptoCardsMoveSchema } from './Schema'
import { cryptoCardsMovePayloadTemplate } from './Template'

export const CryptoCardsMovePayloadPlugin = () =>
  createPayloadPlugin<XyoCryptoCardsMovePayload>({
    schema: XyoCryptoCardsMoveSchema,
    template: cryptoCardsMovePayloadTemplate,
  })
