import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { CryptoWalletNftPayload } from './Payload'
import { NftSchema } from './Schema'
import { cryptoWalletNftPayloadTemplate } from './Template'

export const CryptoWalletNftPayloadPlugin = () =>
  createPayloadPlugin<CryptoWalletNftPayload>({
    schema: NftSchema,
    template: cryptoWalletNftPayloadTemplate,
  })
