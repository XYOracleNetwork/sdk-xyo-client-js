import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { ElevationPayload } from './Payload'
import { ElevationSchema } from './Schema'
import { elevationPayloadTemplate } from './Template'

export const ElevationPayloadPlugin = () =>
  createPayloadPlugin<ElevationPayload>({
    schema: ElevationSchema,
    template: elevationPayloadTemplate,
  })
