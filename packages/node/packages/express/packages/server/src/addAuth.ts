import 'reflect-metadata'

import { container } from '@xyo-network/express-node-dependencies'
import {
  addAuthRoutes,
  AdminApiKeyStrategy,
  adminApiKeyStrategyName,
  AllowUnauthenticatedStrategy,
  allowUnauthenticatedStrategyName,
  JwtStrategy,
  jwtStrategyName,
  LocalStrategy,
  localStrategyName,
  Web3AuthStrategy,
  web3StrategyName,
} from '@xyo-network/express-node-middleware'
import { Application } from 'express'
import { decorate, injectable } from 'inversify'
import passport, { Strategy } from 'passport'

decorate(injectable(), Strategy)

export const addAuth = (app: Application) => {
  passport.use(adminApiKeyStrategyName, container.get(AdminApiKeyStrategy))
  passport.use(allowUnauthenticatedStrategyName, container.get(AllowUnauthenticatedStrategy))
  const jwtStrategy = container.get(JwtStrategy)
  passport.use(jwtStrategyName, jwtStrategy)
  addAuthRoutes(jwtStrategy.jwtRequestHandler)
  passport.use(localStrategyName, container.get(LocalStrategy))
  passport.use(web3StrategyName, container.get(Web3AuthStrategy))

  const userRoutes = addAuthRoutes(jwtStrategy.jwtRequestHandler)
  app.use('', userRoutes)
}
