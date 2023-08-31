'use strict'

// customFunctions.js
module.exports = {
  double: (input) => input.value * 2,
  add: (input) => input.value1 + input.value2,
  concat: (input) => input.key1 + input.key2,
  uppercase: (input) => input.key.toUpperCase(),
  lowercase: (input) => input.key.toLowerCase(),
  addFixed: (input, fixedValue) => input.value + fixedValue,
  subtractFixed: (input, fixedValue) => input.value - fixedValue,
  multiplyByFixed: (input, fixedValue) => input.value * fixedValue,
  divideByFixed: (input, fixedValue) => input.value / fixedValue,
  parseInt: (input) => parseInt(input.key, 10),
  parseFloat: (input) => parseFloat(input.key),
  round: (input) => Math.round(input.value),
  length: (input) => input.key.length,
  slice: (input, start, end) => input.key.slice(start, end),
  mapValues: (input, valueMap) => valueMap[input.value] || input.value,
  replace: (input, searchValue, newValue) => input.key.replace(searchValue, newValue),
  extract: (input, regex) => {
    const match = input.key.match(new RegExp(regex))
    return match ? match[0] : ''
  },
  hexToBase64UrlSafe: (input) => { return Buffer.from(input.key, 'hex').toString('base64url') },
}

