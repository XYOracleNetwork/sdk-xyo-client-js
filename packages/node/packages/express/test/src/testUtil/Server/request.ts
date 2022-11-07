import { getApp } from '@xyo-network/express-node-server'
import { Express } from 'express'
import supertest, { SuperTest, Test } from 'supertest'

let app: Express | undefined

export async function request(): Promise<SuperTest<Test>> {
  if (!app) app = await getApp()
  return supertest(app)
}
