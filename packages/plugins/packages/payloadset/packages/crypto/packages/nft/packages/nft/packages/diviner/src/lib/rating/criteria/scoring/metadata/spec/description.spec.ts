import { scoreDescription } from '../description'
import { expectMaxPossibleScore, expectMiniumScore } from './testHelpers.spec'

const valid = [
  '*This drop features new payment methods including Metamask, Apple Pay, Google Pay, Buy Now Pay Later, Nifty Balance, and Gemini Balance! On top of this, you will now be able to purchase multiple editions in a single transaction. Prepaid ETH will not be an allowed payment method for the Open Edition.*\r\n\r\n---\r\n\r\nBriefing: UnderAqua is an underwater universe born out of chaos from the mind of Kenny Scharf. This unique one of a kind story of a post nuclear universe is told through NFT’s and the participation from its collectors, AKA scientists. This concept represents what is possible when a community comes together to accomplish a goal for the greater good.\r\n\r\nThe Year: 2045\r\n\r\nThe Place: An abandoned nuclear power plant off the coast of the Pacific.\r\n\r\nThe Situation: Unforeseen tectonic movements and intensifying ocean waves crashing against the complex have eroded the bordering wall of a nuclear facility – and small cracks have begun to spider along with the concrete. Unbeknownst to all, highly toxic ooze has been seeping into the surrounding waters, converging with a century of untended plastic pollution. When scientists at the plant finally discover the leak – years after it began – they find that the doomed wildlife has been ravaged by hazardous plastics and radiation from the nuclear plant, permanently mutating the fish, with some exhibiting erratic behaviors and unnatural abilities. For example, some fish have become mutated and others have built underwater metropolises. Some fish have grown legs while others have grown wings. Some smoke weed and some take steroids. The impact of the superpowers combined with their newly found free will is something never before seen. Now it is up to us, a massive task force of analysts known as “UnderAqua,” to study the effects of radiation on the fish. Each of the experts will be granted full access to the plant’s staff, tools, and the quarantined areas, which are presumed to house infected species of fish.\r\n\r\nThe Mission: The lead scientist has a hypothesis that although these fish’s superpowers can be dangerous, if studied correctly, we can find answers to some of humanity’s biggest threats. So our goal is to study these fish and figure out not only what specific mutation happened, but figure out how we can apply these superpower-like abilities to help the society for the greater good of humanity.',
  'Airdrop for holders',
]
const invalid = [{}]
const missing = ['', undefined, null]

describe('scoreDescription', () => {
  describe('with valid description', () => {
    it.each(valid)('returns max possible score', (value) => {
      const score = scoreDescription(value)
      expectMaxPossibleScore(score)
    })
  })
  describe('with missing or invalid description', () => {
    it.each([...missing, ...invalid])('returns minimum score', (value) => {
      const score = scoreDescription(value)
      expectMiniumScore(score)
    })
  })
})
