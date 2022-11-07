import { Identifiable } from './Identifiable'

export interface Web2User {
  email: string
  passwordHash: string
}
export interface Web3User {
  address: string
}

export type UserWithoutId = Partial<Web2User> & Partial<Web3User>
export type User = Identifiable & UserWithoutId
