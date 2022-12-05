import { XyoPayload } from '@xyo-network/payload'

import { LocationHeadingSchema } from './HeadingSchema'

export type Acceleration = {
  acceleration: number
}

export type Direction = {
  direction: number
}

export type Speed = {
  speed: number
}

export type Velocity = Direction & Speed

export type Motion = Velocity & Partial<Acceleration>

export type LocationHeading = Motion | Direction

export type LocationHeadingPayload = XyoPayload<LocationHeading, LocationHeadingSchema>
