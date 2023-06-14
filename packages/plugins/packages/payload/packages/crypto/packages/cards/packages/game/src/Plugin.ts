import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { CryptoCardsGamePayload } from './Payload'
import { CryptoCardsGameSchema } from './Schema'
import { cryptoCardsGamePayloadTemplate } from './Template'

export const CryptoCardsGamePayloadPlugin = () =>
  createPayloadPlugin<CryptoCardsGamePayload>({
    schema: CryptoCardsGameSchema,
    template: cryptoCardsGamePayloadTemplate,
  })
