import { EthereumGasPayload } from './Payload'
import { EthereumGasSchema } from './Schema'

export const ethereumGasPayloadTemplate = (): Partial<EthereumGasPayload> => ({
  schema: EthereumGasSchema,
})
