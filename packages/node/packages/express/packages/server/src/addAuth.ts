import 'reflect-metadata'

import { dependencies } from '@xyo-network/express-node-dependencies'
import {
  addAuthRoutes,
  AdminApiKeyStrategy,
  adminApiKeyStrategyName,
  AllowUnauthenticatedStrategy,
  allowUnauthenticatedStrategyName,
  ArchiveAccessControlStrategy,
  archiveAccessControlStrategyName,
  ArchiveAccountStrategy,
  archiveAccountStrategyName,
  ArchiveApiKeyStrategy,
  archiveApiKeyStrategyName,
  ArchiveOwnerStrategy,
  archiveOwnerStrategyName,
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
  passport.use(adminApiKeyStrategyName, dependencies.get(AdminApiKeyStrategy))
  passport.use(allowUnauthenticatedStrategyName, dependencies.get(AllowUnauthenticatedStrategy))
  passport.use(archiveAccessControlStrategyName, dependencies.get(ArchiveAccessControlStrategy))
  passport.use(archiveAccountStrategyName, dependencies.get(ArchiveAccountStrategy))
  passport.use(archiveApiKeyStrategyName, dependencies.get(ArchiveApiKeyStrategy))
  passport.use(archiveOwnerStrategyName, dependencies.get(ArchiveOwnerStrategy))
  const jwtStrategy = dependencies.get(JwtStrategy)
  passport.use(jwtStrategyName, jwtStrategy)
  addAuthRoutes(jwtStrategy.jwtRequestHandler)
  passport.use(localStrategyName, dependencies.get(LocalStrategy))
  passport.use(web3StrategyName, dependencies.get(Web3AuthStrategy))

  const userRoutes = addAuthRoutes(jwtStrategy.jwtRequestHandler)
  app.use('', userRoutes)
}
