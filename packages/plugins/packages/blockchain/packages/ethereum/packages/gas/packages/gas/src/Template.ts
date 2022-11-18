import { XyoEthereumGasPayload } from './Payload'
import { XyoEthereumGasSchema } from './Schema'

export const XyoEthereumGasPayloadTemplate = (): Partial<XyoEthereumGasPayload> => ({
  schema: XyoEthereumGasSchema,
})
