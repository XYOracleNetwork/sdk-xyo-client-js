import { Parser } from 'bowser'

import { XyoSystemInfoBrowserPayloadSchema } from './Payload'

export const SystemInfoBrowserWitnessTemplate = () => ({
  bowser: {
    browser: {} as Parser.ParsedResult['browser'],
    engine: {} as Parser.ParsedResult['engine'],
    os: {} as Parser.ParsedResult['os'],
    platform: {} as Parser.ParsedResult['platform'],
  },
  schema: XyoSystemInfoBrowserPayloadSchema,
})
