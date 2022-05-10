import { XyoIdPayload } from './Payload'

export const idTemplate = (): XyoIdPayload => ({
  salt: '',
  schema: 'network.xyo.id',
})
