import '@xylabs/vitest-extended'

import {
  describe, expect, test,
} from 'vitest'

import { Quadkey } from '../Quadkey.ts'

describe('Quadkey', () => {
  test('Valid Items', () => {
    const qk = Quadkey.fromBase4String('0203')
    expect(qk.base16String).toBe('00000000000000000000000000000000000000000000000000000000000023')
    expect(qk.zoom).toBe(4)
    expect(qk.base4Hash).toBe('0203')
    const center = qk?.center
    expect(center?.lat).toBe(48.378_236)
    expect(center?.lng).toBe(-146.25)
  })
  test('Zero Children', () => {
    const qk = Quadkey.Zero
    expect(qk.base16String).toBe('00000000000000000000000000000000000000000000000000000000000000')
    expect(qk.zoom).toBe(0)
    expect(qk.base4Hash).toBe('')
    const children = qk?.children
    expect(children?.length).toBe(4)
    expect(children?.[0].base4Hash).toBe('0')
    expect(children?.[1].base4Hash).toBe('1')
    expect(children?.[2].base4Hash).toBe('2')
    expect(children?.[3].base4Hash).toBe('3')
  })
})
