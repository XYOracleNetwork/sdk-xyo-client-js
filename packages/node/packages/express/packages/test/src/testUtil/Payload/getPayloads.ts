import { getPayload } from './getPayload'

export const getPayloads = (numPayloads: number) => {
  return new Array(numPayloads).fill(0).map(getPayload)
}
