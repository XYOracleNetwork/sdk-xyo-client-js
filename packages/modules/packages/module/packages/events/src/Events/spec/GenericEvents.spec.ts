import '@xylabs/vitest-extended'

import { delay } from '@xylabs/delay'
import type { Promisable } from '@xylabs/promise'
import {
  describe, expect, it,
} from 'vitest'

import type { EventData } from '../../model/index.ts'
import { Events } from '../Events.ts'

type ParentTestEvents = {
  parentTest: { test: boolean }
  parentTestNumber: { testNumber: number }
}

type TestEvents<TEvents extends EventData> = {
  test: { test: boolean }
  testNumber: { testNumber: number }
} & TEvents

type AllTestEvents = TestEvents<ParentTestEvents>

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
  const sut = new Events<AllTestEvents>()
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
