import { Parser } from 'bowser'

import { XyoSystemInfoPayload } from '../../../Witnesses'

export interface XyoSystemInfoBrowserPayload extends XyoSystemInfoPayload {
  bowser?: Parser.ParsedResult
}
