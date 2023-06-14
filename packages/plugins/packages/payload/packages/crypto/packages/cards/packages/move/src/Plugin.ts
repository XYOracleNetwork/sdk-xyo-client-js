import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { CryptoCardsMovePayload } from './Payload'
import { CryptoCardsMoveSchema } from './Schema'
import { cryptoCardsMovePayloadTemplate } from './Template'

export const CryptoCardsMovePayloadPlugin = () =>
  createPayloadPlugin<CryptoCardsMovePayload>({
    schema: CryptoCardsMoveSchema,
    template: cryptoCardsMovePayloadTemplate,
  })
