import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoCryptoCardsGamePayload } from './Payload'
import { XyoCryptoCardsGameSchema } from './Schema'
import { cryptoCardsGamePayloadTemplate } from './Template'

export const CryptoCardsGamePayloadPlugin = () =>
  createPayloadPlugin<XyoCryptoCardsGamePayload>({
    schema: XyoCryptoCardsGameSchema,
    template: cryptoCardsGamePayloadTemplate,
  })
