import express, { RequestHandler, Router } from 'express'

import { requireLoggedIn } from './AuthStrategies'
import { getUserProfile, postAccountChallenge, postUserSignup } from './routes'
import { adminApiKeyStrategy, localStrategy, web3Strategy } from './strategy'

// eslint-disable-next-line import/no-named-as-default-member
const router: Router = express.Router()

// Properly initialized after auth is configured
let respondWithJwt: RequestHandler = () => {
  throw new Error('JWT Auth Incorrectly Configured')
}

// web2 flow
router.post(
  '/user/login',
  localStrategy,
  (req, res, next) => respondWithJwt(req, res, next),
  /*
    #swagger.tags = ['User']
    #swagger.basePath = '/'
    #swagger.summary = 'Log in (web2)'
  */
)

// web3 flow
router.post(
  '/account/:address/challenge',
  postAccountChallenge /*
    #swagger.tags = ['Account']
    #swagger.basePath = '/'
    #swagger.summary = 'Challenge (web3)'
  */,
)
router.post(
  '/wallet/:address/challenge',
  postAccountChallenge /*
    #swagger.tags = ['Wallet']
    #swagger.basePath = '/'
    #swagger.deprecated = true
    #swagger.summary = 'Temporary support for legacy calls'
  */,
)
router.post(
  '/account/:address/verify',
  web3Strategy,
  (req, res, next) => respondWithJwt(req, res, next) /*
    #swagger.tags = ['Account']
    #swagger.basePath = '/'
    #swagger.summary = 'Verify (web3)'
  */,
)
router.post(
  '/wallet/:address/verify',
  web3Strategy,
  (req, res, next) => respondWithJwt(req, res, next) /*
    #swagger.tags = ['Wallet']
    #swagger.basePath = '/'
    #swagger.deprecated = true
    #swagger.summary = 'Temporary support for legacy calls'
  */,
)

router.get(
  '/user/profile',
  requireLoggedIn,
  getUserProfile /*
    #swagger.tags = ['User']
    #swagger.basePath = '/'
    #swagger.summary = 'Get user profile data'
  */,
)

router.post(
  '/user/signup',
  adminApiKeyStrategy,
  postUserSignup /*
    #swagger.tags = ['User']
    #swagger.basePath = '/'
    #swagger.summary = 'Create an account (web2)'
  */,
)

export const addAuthRoutes = (jwtRequestHandler: RequestHandler): Router => {
  respondWithJwt = jwtRequestHandler
  return router
}
