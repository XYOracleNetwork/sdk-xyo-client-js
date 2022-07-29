import { Parser } from 'bowser'

import { XyoSystemInfoPayload } from '../shared'

export interface XyoSystemInfoBrowserPayload extends XyoSystemInfoPayload {
  bowser?: Parser.ParsedResult
}
