import 'source-map-support/register'

import { asyncHandler, NoReqParams } from '@xylabs/sdk-api-express-ecs'
import { User, UserWithoutId } from '@xyo-network/node-core-model'
import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { toUserDto } from '../../../dto'

const message = 'Signup successful'

interface UserToCreate extends UserWithoutId {
  password?: string
}

export interface UserCreationResponse {
  message: string
  user: User
}

const handler = async (req: Request<NoReqParams, UserCreationResponse, UserToCreate>, res: Response<UserCreationResponse>, next: NextFunction) => {
  const userToCreate = req.body
  const password = userToCreate.password
  if (password) {
    delete userToCreate.password
  }
  const createdUser = await req.app.userManager.create(userToCreate, password)
  if (!createdUser) {
    next({ message: 'Error creating user' })
    return
  }
  const updated = createdUser.updated
  const user = toUserDto(createdUser)
  res.status(updated ? StatusCodes.OK : StatusCodes.CREATED).json({
    message,
    user,
  })
}

export const postUserSignup = asyncHandler(handler)
