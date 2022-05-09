import { Parser } from 'bowser'

import { XyoSystemInfoPayload } from './Payload'

export const systemInfoTemplate: XyoSystemInfoPayload = {
  bowser: {
    browser: {} as Parser.ParsedResult['browser'],
    engine: {} as Parser.ParsedResult['engine'],
    os: {} as Parser.ParsedResult['os'],
    platform: {} as Parser.ParsedResult['platform'],
  },
  schema: 'network.xyo.system.info',
  systeminformation: {},
}
