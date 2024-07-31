import { AnyObject } from '@xylabs/object'
import { Payload } from '@xyo-network/payload-model'

export const hasTimestamp = <T extends Payload = Payload<AnyObject>>(payload: T): payload is T & { timestamp: number } => {
  return (payload as unknown as { timestamp: number }).timestamp !== undefined
}
