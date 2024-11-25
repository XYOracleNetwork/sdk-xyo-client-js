import '@xylabs/vitest-extended'

import { delay } from '@xylabs/delay'
import type { Promisable } from '@xylabs/promise'
import {
  describe, expect, it,
} from 'vitest'

import { Events } from '../Events.ts'

type TestEvents = {
  test: { test: boolean }
  testNumber: { testNumber: number }
}

const waitFor = async (check: () => boolean, timeout = 5000) => {
  const startTime = Date.now()
  while (!check()) {
    if (Date.now() - startTime > timeout) {
      return false
    }
    await delay(100)
  }
  return true
}

const callbackTest = async (fn: (complete: () => void) => Promisable<void>, timeout?: number) => {
  let completed = false
  await fn(() => {
    completed = true
  })
  expect(await waitFor(() => completed, timeout)).toBeTrue()
}

/**
 * @group module
 */

describe('Events', () => {
  const sut = new Events<TestEvents>()
  it('should instantiate', () => {
    expect(sut).toBeTruthy()
  })

  it('should emit test event', async () => {
    await callbackTest(async (complete) => {
      sut.on('test', ({ test }) => {
        expect(test).toBeTrue()
        complete()
      })
      await sut.emit('test', { test: true })
    })
  })

  it('should emit testNumber event', async () => {
    await callbackTest(async (complete) => {
      sut.on('testNumber', ({ testNumber }) => {
        expect(testNumber).toBeNumber()
        complete()
      })
      await sut.emit('testNumber', { testNumber: 1 })
    })
  })
})
