import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoCryptoCardsMovePayload } from './Payload'
import { XyoCryptoCardsMoveSchema } from './Schema'
import { cryptoCardsMovePayloadTemplate } from './Template'

export const CryptoCardsMovePayloadPlugin = () =>
  createXyoPayloadPlugin<XyoCryptoCardsMovePayload>({
    schema: XyoCryptoCardsMoveSchema,
    template: cryptoCardsMovePayloadTemplate,
  })
