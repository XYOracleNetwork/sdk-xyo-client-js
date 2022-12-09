import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoCryptoCardsGamePayload } from './Payload'
import { XyoCryptoCardsGameSchema } from './Schema'
import { cryptoCardsGamePayloadTemplate } from './Template'

export const CryptoCardsGamePayloadPlugin = () =>
  createXyoPayloadPlugin<XyoCryptoCardsGamePayload>({
    schema: XyoCryptoCardsGameSchema,
    template: cryptoCardsGamePayloadTemplate,
  })
