import { NftAttribute, NftInfo, OpenSeaNftAttribute, OpenSeaNftInfo } from '@xyo-network/crypto-wallet-nft-payload-plugin'

import { incrementPossible, incrementTotal, incrementTotalAndPossible, ScaledScore } from '../../../../score'

const isDate = (value: unknown): value is Date => {
  if (isNumber(value)) {
    try {
      new Date(value)
      return true
    } catch (error) {
      return false
    }
  }
  return false
}

const isNumber = (value: unknown): value is number => typeof value === 'number'

const isPercentage = (value: unknown): boolean => isNumber(value) && value >= 0 && value <= 100

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.length > 0

const isNonEmptyStringOrNumber = (value: unknown): value is string | number => value === 'number' || isNonEmptyString(value)

export const evaluateNftAttributes = (nft: NftInfo | OpenSeaNftInfo): ScaledScore =>
  !nft?.metadata?.attributes ? [0, 1] : evaluateAttributes(nft?.metadata?.attributes)

export const evaluateAttributes = (attributes: NftAttribute[] | OpenSeaNftAttribute[] | unknown): ScaledScore => {
  if (!attributes || !Array.isArray(attributes) || attributes.length === 0) return [0, 1]
  const score: ScaledScore = [0, 0]
  for (const attribute of attributes) {
    const [attributeTotal, attributePossible] = evaluateAttribute(attribute)
    incrementTotalAndPossible(score, attributeTotal, attributePossible)
  }
  return [1, 1]
}

export const evaluateAttribute = (attribute: OpenSeaNftAttribute): ScaledScore => {
  const score: ScaledScore = [0, 1]
  const max_value = attribute?.max_value
  const trait_type = attribute?.trait_type
  const value = attribute?.value

  // Validate trait_type & value
  if (!attribute || typeof attribute !== 'object' || !isNonEmptyString(trait_type) || !isNonEmptyStringOrNumber(value)) return score
  incrementTotal(score)

  // Validate display_type
  incrementPossible(score)
  if (validDisplayType(attribute)) incrementTotal(score)

  // Validate max_value
  if (max_value !== undefined) {
    incrementPossible(score)
    if (isNumber(max_value) && isNumber(value) && value <= max_value) incrementTotal(score)
  }

  return score
}

const validDisplayType = (attribute: OpenSeaNftAttribute): boolean => {
  switch (attribute?.display_type) {
    case 'number':
    case 'boost_number': {
      if (isNumber(attribute?.value)) return true
      break
    }
    case 'boost_percentage': {
      if (isPercentage(attribute?.value)) return true
      break
    }
    case 'date': {
      if (isDate(attribute?.value)) return true
      break
    }
    case 'string':
    case undefined: {
      if (isNonEmptyString(attribute?.value)) return true
      break
    }
    default: {
      break
    }
  }
  return false
}
