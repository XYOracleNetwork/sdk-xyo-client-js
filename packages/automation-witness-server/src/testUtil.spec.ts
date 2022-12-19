import supertest, { SuperTest, Test } from 'supertest'

// NOTE: Ensure this is always before importing the server
// so that any timers set (for CRON jobs for example) don't
// prevent Jest from exiting
jest.useFakeTimers()

import { getApp } from './Server'

test('Must have ACCOUNT_SEED ENV VAR defined', () => {
  expect(process.env.ACCOUNT_SEED).toBeTruthy()
})

// const request = supertest(getApp())

export const getAutomationWitness = (): SuperTest<Test> => {
  return supertest(getApp())
}
