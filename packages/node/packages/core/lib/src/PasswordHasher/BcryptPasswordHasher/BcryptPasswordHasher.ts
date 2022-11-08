import { PasswordHasher, User } from '@xyo-network/node-core-model'
import { compare, hash } from 'bcrypt'

export const BcryptPasswordHasher: PasswordHasher<User> = {
  hash: (password: string) => {
    return hash(password, 10)
  },
  verify: (user: User, providedPassword: string) => {
    if (!user.passwordHash) {
      return Promise.resolve(false)
    }
    return compare(providedPassword, user.passwordHash)
  },
}
