import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { CryptoContractFunctionCallResult, CryptoContractFunctionCallResultSchema } from './Payload'

export const CryptoContractFunctionCallPayloadPlugin = () =>
  createPayloadPlugin<CryptoContractFunctionCallResult>({
    schema: CryptoContractFunctionCallResultSchema,
  })
