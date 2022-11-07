import 'reflect-metadata'

import { assertEx } from '@xylabs/assert'
import { Identifiable, PasswordHasher, UpsertResult, User, UserManager, UserWithoutId, Web2User, Web3User } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { inject, injectable } from 'inversify'
import { OptionalId } from 'mongodb'

import { MongoDBUserArchivist } from '../../Archivist'

const fromDbEntity = (user: OptionalId<User>): User => {
  const id = user?._id?.toHexString?.()
  if (id) {
    user.id = id
    delete user?._id
  }
  return user
}

const toDbEntity = (user: UserWithoutId) => {
  if (user?.email) {
    user.email = user.email.toLowerCase()
  }
  if (user?.address) {
    user.address = user.address.toLowerCase()
  }
  return user
}

@injectable()
export class MongoDBUserManager implements UserManager {
  constructor(
    @inject(MongoDBUserArchivist) protected readonly mongo: MongoDBUserArchivist,
    @inject(TYPES.PasswordHasher) protected readonly passwordHasher: PasswordHasher<User>,
  ) {}
  async create(user: UserWithoutId, password?: string): Promise<Identifiable & Partial<Web2User> & Partial<Web3User> & UpsertResult> {
    if (password) {
      user.passwordHash = await this.passwordHasher.hash(password)
    }
    const result = (await this.mongo.insert([toDbEntity(user)])).pop()
    const created = assertEx(result, 'Invalid user creation')
    return { ...fromDbEntity(created), updated: created.updated }
  }
  async findByEmail(email: string): Promise<User | null> {
    email = email.toLowerCase()
    const user = await this.mongo.find({ email })
    return user.length ? fromDbEntity(user[0]) : null
  }
  async findById(id: string): Promise<User | null> {
    const users = await this.mongo.get([id])
    const user = users.pop()
    return user ? fromDbEntity(user) : null
  }
  async findByWallet(address: string): Promise<User | null> {
    address = address.toLowerCase()
    const user = await this.mongo.find({ address })
    return user.length ? fromDbEntity(user[0]) : null
  }
}
