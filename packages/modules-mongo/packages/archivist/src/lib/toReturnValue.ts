import { BoundWitness } from '@xyo-network/boundwitness-model'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

export const toReturnValue = (value: Payload | BoundWitness): Payload => {
  const _signatures = (value as BoundWitness)?._signatures
  if (_signatures) {
    return { ...PayloadWrapper.wrap(value).body(), _signatures } as BoundWitness
  } else {
    return { ...PayloadWrapper.wrap(value).body() }
  }
}
