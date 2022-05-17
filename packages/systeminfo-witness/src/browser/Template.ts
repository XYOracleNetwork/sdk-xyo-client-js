import { Parser } from 'bowser'

export const SystemInfoBrowserWitnessTemplate = () => ({
  bowser: {
    browser: {} as Parser.ParsedResult['browser'],
    engine: {} as Parser.ParsedResult['engine'],
    os: {} as Parser.ParsedResult['os'],
    platform: {} as Parser.ParsedResult['platform'],
  },
  schema: 'network.xyo.system.info.browser',
})
