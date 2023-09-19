import { scoreImageData } from '../imageData'
import { expectMaxPossibleScore, expectMiniumScore } from './testHelpers'

const valid = [
  "<svg xmlns='http://www.w3.org/2000/svg' version='1.1' width='2000' height='2000'><style>.m1 #c{fill: #fff;}.m1 #r{fill: #000;}.m2 #c{fill: #fc3;}.m2 #r{fill: #000;}.m3 #c{fill: #fff;}.m3 #r{fill: #33f;}.m4 #c{fill: #fff;}.m4 #r{fill: #f33;}.a #c{fill: #000 !important;}.a #r{fill: #fff !important;}</style><g class='m1 c3'><rect id='r' width='2000' height='2000'/><circle id='c' cx='1000' cy='1000' r='146.2449'/></g></svg>",
]
const invalid = ['<svg>\n\t\t<path\td=" class="" />\n</svg>', '<svg></svg', '<svg></', '<html></html>', '', 'not an SVG', {}]
const missing = [undefined, null]

describe('scoreImageData', () => {
  describe('with valid image data', () => {
    it.each(valid)('return max possible score', (value) => {
      const score = scoreImageData(value)
      expectMaxPossibleScore(score)
    })
  })
  describe('with invalid image data', () => {
    it.each(invalid)('returns minimum score', (value) => {
      const score = scoreImageData(value)
      expectMiniumScore(score)
    })
  })
  describe('with no image data', () => {
    it.each(missing)('returns minimum score', (value) => {
      const score = scoreImageData(value)
      expectMiniumScore(score)
    })
  })
})
