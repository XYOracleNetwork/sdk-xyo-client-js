import { XyoEthereumGasPayload } from './Payload'
import { XyoEthereumGasSchema } from './Schema'

export const ethereumGasPayloadTemplate = (): Partial<XyoEthereumGasPayload> => ({
  schema: XyoEthereumGasSchema,
})
