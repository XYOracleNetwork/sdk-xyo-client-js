import type { LocationQueryCreationRequest } from './LocationQueryCreationRequest.ts'

export interface LocationQueryCreationResponse extends LocationQueryCreationRequest {
  hash: string
}
