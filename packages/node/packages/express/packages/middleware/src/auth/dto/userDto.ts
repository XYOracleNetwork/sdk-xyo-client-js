import { User } from '@xyo-network/node-core-model'

export interface IUserDto {
  id: string
}
export interface IWeb2UserDto {
  email: string
}
export interface IWeb3UserDto {
  address: string
}

export type UserDto = IUserDto & Partial<IWeb2UserDto> & Partial<IWeb3UserDto>

export const toUserDto = (user?: Partial<User>): UserDto => {
  if (!user?.id) {
    throw new Error('Invalid user')
  }
  const dto: UserDto = { id: user.id }
  if (user.email) {
    dto.email = user.email
  }
  if (user.address) {
    dto.address = user.address
  }
  return dto
}
