import { ImageThumbnailWitness } from '../Witness'

describe('Witness', () => {
  describe('checkIpfsUrl', () => {
    const cases: [uri: string, expected: string][] = [['', '']]
    it.each(cases)('%s', (input, expected) => {
      ImageThumbnailWitness.checkIpfsUrl(input)
    })
  })
})
