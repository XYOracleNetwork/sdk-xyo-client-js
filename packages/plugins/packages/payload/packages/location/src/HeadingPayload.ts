import { Payload } from '@xyo-network/payload-model'

import { LocationHeadingSchema } from './HeadingSchema'

export type Acceleration = {
  acceleration: number
}

export type Heading = {
  heading: number
}

export type Speed = {
  speed: number
}

export type Velocity = Heading & Speed

export type Motion = Velocity & Partial<Acceleration>

export type LocationHeading = Motion | Heading

export type LocationHeadingPayload = Payload<LocationHeading, LocationHeadingSchema>
