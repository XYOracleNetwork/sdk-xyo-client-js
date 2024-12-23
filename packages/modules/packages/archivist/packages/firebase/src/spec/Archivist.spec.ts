import fs from 'node:fs'

import type { RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import {
  afterAll,
  beforeAll, expect, test,
} from 'vitest'

import { FirebaseArchivist } from '../Archivist.ts'
import { FirebaseArchivistConfigSchema } from '../Config.ts'

let testEnv: RulesTestEnvironment

beforeAll(async () => {
  // Initialize the test environment with the Firestore emulator
  testEnv = await initializeTestEnvironment({
    projectId: 'test-project', // Specify your project ID
    firestore: {
      rules: fs.readFileSync(
        'packages/modules/packages/archivist/packages/firebase/src/spec/firestore.rules',
        'utf8',
      ),
    }, // Load Firestore security rules
  })
})

test.skip('FirebaseArchivist Load', async () => {
  const firebaseApp = testEnv.authenticatedContext('test')
  const db = firebaseApp.firestore()
  db.useEmulator('localhost', 8080)

  const archivist = (await FirebaseArchivist.create({
    account: 'random',
    config: { schema: FirebaseArchivistConfigSchema },
  })) as FirebaseArchivist
  const all = await archivist.all()
  expect(all.length).toBe(4)
})

afterAll(async () => {
  // Clean up the test environment
  await testEnv?.cleanup()
})
