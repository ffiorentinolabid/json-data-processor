'use strict'

// customFunctions.js
module.exports = {
  double: (input) => input.value * 2,
  add: (input) => input.value1 + input.value2,
  concat: (input) => input.str1 + input.str2,
  uppercase: (input) => input.str.toUpperCase(),
  lowercase: (input) => input.str.toLowerCase(),
  addFixed: (input, fixedValue) => input.value + fixedValue,
  subtractFixed: (input, fixedValue) => input.value - fixedValue,
  multiplyByFixed: (input, fixedValue) => input.value * fixedValue,
  divideByFixed: (input, fixedValue) => input.value / fixedValue,
  parseInt: (input) => parseInt(input.str, 10),
  parseFloat: (input) => parseFloat(input.str),
  round: (input) => Math.round(input.value),
  length: (input) => input.str.length,
  slice: (input, start, end) => input.str.slice(start, end),
  mapValues: (input, valueMap) => valueMap[input.value] || input.value,
  replace: (input, searchValue, newValue) => input.str.replace(searchValue, newValue),
  extract: (input, regex) => {
    const match = input.str.match(new RegExp(regex))
    return match ? match[0] : ''
  },
}

