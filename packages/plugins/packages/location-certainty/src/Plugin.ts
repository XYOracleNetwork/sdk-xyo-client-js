import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { LocationCertaintyDiviner, LocationCertaintyDivinerConfigSchema } from './Diviner'
import { LocationCertaintyPayload } from './Payload'
import { LocationCertaintySchema } from './Schema'
import { LocationCertaintyPayloadTemplate } from './Template'

export const LocationCertaintyPayloadPlugin = () =>
  createXyoPayloadPlugin<LocationCertaintyPayload>({
    auto: true,
    diviner: (config): LocationCertaintyDiviner => {
      return new LocationCertaintyDiviner({
        config: {
          ...config,
          schema: LocationCertaintyDivinerConfigSchema,
          targetSchema: LocationCertaintySchema,
        },
      })
    },
    schema: LocationCertaintySchema,
    template: LocationCertaintyPayloadTemplate,
  })
