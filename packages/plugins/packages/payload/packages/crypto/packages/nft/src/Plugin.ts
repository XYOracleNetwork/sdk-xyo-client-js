import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { CryptoWalletNftPayload } from './Payload'
import { CryptoWalletNftSchema } from './Schema'
import { cryptoWalletNftPayloadTemplate } from './Template'

export const CryptoWalletNftPayloadPlugin = () =>
  createPayloadPlugin<CryptoWalletNftPayload>({
    schema: CryptoWalletNftSchema,
    template: cryptoWalletNftPayloadTemplate,
  })
