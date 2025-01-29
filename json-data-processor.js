'use strict'

const JsonPath = require('jsonpath')
const Velocity = require('velocityjs')
const jsonata = require('jsonata')
const url = require('url')
const axios = require('axios')
const fs = require('fs')
const pino = require('pino')
const cf = require('./custom-functions')


class JsonDataProcessor {
  constructor(config) {
    this.config = config
    this.globalState = {}
    this.axios = axios.create({
    })
    this.logger = pino({
      level: config.logLevel || 'info',
      targets: [{
        level: 'info',
        target: 'pino-pretty',
        options: {},
      },
      ],
    })
    decorateResponseWithDuration(this.axios)
  }
  /* eslint-disable no-await-in-loop */
  async processData(inputData) {
    let outputKey
    for (let i = 0; i < this.config.steps.length; i++) {
      const step = this.config.steps[i]
      const stepName = step.name || `outputStep${i}`
      let input
      if (step.input === 'original') {
        input = inputData
      } else if (step.input === 'previous') {
        input = this.globalState[outputKey] || inputData
      } else {
        input = this.globalState[step.input] || inputData
      }
      outputKey = step.outputKey || stepName

      if (step.output === 'global') { this.globalState = {} }
      let outputData
      this.logger.debug({ input }, `Step ${i + 1} Input`)
      switch (step.type) {
      case 'jsonpath':
        outputData = await this.applyJSONPath(input, step)
        break
      case 'vtl':
        outputData = await this.applyVTL(input, step)
        break
      case 'custom':
        // New logic for custom function steps
        outputData = await this.applyCustomFunction(input, step)
        break
      case 'jsonata':
        outputData = await this.applyJSONata(input, step)
        break
      case 'url':
        outputData = await this.buildUrl(input, step)
        break
      case 'axios':
        outputData = await this.applyApiCall(input, step, this.globalState)
        break

      default:
        throw new Error(`Unsupported step type: ${step.type}`)
      }
      this.set(this.globalState, outputKey, outputData)
      this.logger.debug({ [outputKey]: outputData }, `Step ${i + 1} Output`)
      if (this.config.logLevel === 'debug') {
        this.set(this.globalState, stepName, outputData)
      }
    }
    this.logger.debug({ globalState: this.globalState }, `globalState Output`)
    return this.globalState
  }

  set(obj, path, value) {
    if (!path) { return value }

    const keys = path.replace(/\[(\d+)]/g, '.$1').split('.')

    return keys.reduce((acc, key, index) => {
      if (index === keys.length - 1) {
        acc[key] = value
      } else if (!(key in acc) || acc[key] === null || typeof acc[key] !== 'object') {
        acc[key] = isNaN(keys[index + 1]) ? {} : []
      }
      return acc[key]
    }, obj)
  }

  escape(str) {
    const replacements = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#039;',
    }

    return str.replace(/[&<>"']/g, (match) => replacements[match])
  }
  sanitize(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitize(item))
    }

    const cleanObj = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key]
        const cleanKey = this.escape(key)
        cleanObj[cleanKey] = this.sanitize(value)
      }
    }
    return cleanObj
  }
  async resolveValue(value, globalState) {
    if (typeof value === 'string' && value.startsWith('$.')) {
      return JsonPath.value(globalState, value)
    }
    return value
  }

  async processParameters(parameters, globalState) {
    const processedParams = {}

    for (const [key, value] of Object.entries(parameters)) {
      if (typeof value === 'string' && value.startsWith('$.')) {
        const queryResults = JsonPath.query(globalState, value)
        //     if (queryResults.length > 1) {
        //   processedParams[key] = queryResults;
        // } else {
        // eslint-disable-next-line prefer-destructuring
        processedParams[key] = queryResults[0]
        // }
      } else {
        processedParams[key] = value
      }
    }
    this.logger.debug({ processedParams })
    return processedParams
  }

  async applyCustomFunction(globalState, step) {
    const { function: customFunction, parameters } = step
    const processedParams = await this.processParameters(parameters, globalState)
    const result = typeof customFunction === 'function' ? customFunction(processedParams) : cf[customFunction](processedParams)
    this.logger.debug({ result }, `customFunction Result`)
    return result
  }

  applyJSONPath(data, step) {
    if (!step.query && !step.value) {
      throw new Error('Missing query for JSONPath step')
    }
    if (step.query) {
      const result = JsonPath.query(data, step.query)
      this.logger.debug({ result }, `JSONPath Result`)
      return result
    }
    const result = JsonPath.value(data, step.value)
    this.logger.debug({ result }, `JSONPath Result`)
    return result
  }

  async applyVTL(data, step) {
    if (!step.template) {
      throw new Error('Missing template for VTL step')
    }
    const templateString = await this.loadTemplate(step.template)
    // const context = { data };
    const asts = Velocity.parse(templateString)
    const result = new Velocity.Compile(asts).render(data)

    try {
      const parsedResult = JSON.parse(result)
      return parsedResult
    } catch (error) {
      return result
    }
  }

  async loadTemplate(template) {
    if (template.type === 'string') {
      return Array.isArray(template.content)
        ? template.content.join('\n')
        : template.content
      // return template.content;
    } else if (template.type === 'file') {
      const filePath = template.path
      try {
        const content = await fs.readFileSync(filePath, 'utf8')
        return content
      } catch (error) {
        throw new Error(
          `Failed to load template from file "${filePath}": ${error.message}`,
        )
      }
    } else {
      throw new Error(`Unsupported template type: ${template.type}`)
    }
  }
  async applyJSONata(data, step) {
    if (!step.expression) {
      throw new Error('Missing query for JSONPath step')
    }
    const expression = jsonata(step.expression)
    const result = await expression.evaluate(data)
    this.logger.debug({ result }, `Result`)
    return result
  }

  async buildUrl(flowMetadata, step) {
    const baseUrl = step.baseURL
    const path = await this.buildPath(step.path, flowMetadata)
    const queryParams = await this.buildQueryParams(
      step.queryParams,
      flowMetadata,
    )

    const urlString = url.format({
      protocol: step.protocol || 'http',
      hostname: baseUrl,
      pathname: path,
      query: queryParams,
    })

    const result = urlString
    this.logger.debug({ result }, `Result`)
    return result
  }

  async buildPath(pathConfig, flowMetadata) {
    const path = pathConfig.map(async(segment) => {
      if (typeof segment === 'string') {
        return segment
      }
      const expression = await jsonata(segment.jsonata)
      const query = await expression.evaluate(flowMetadata)
      if (query) {
        return query
      }
      return null
    })
    const result = (await Promise.all(path)).filter(Boolean).join('/')
    return result
  }

  buildQueryParams(queryParamsConfig, flowMetadata) {
    const queryParams = {}

    for (const key in queryParamsConfig) {
      if (Object.hasOwnProperty.call(queryParamsConfig, key)) {
        const configValue = queryParamsConfig[key]
        if (typeof configValue === 'string') {
          queryParams[key] = configValue
        } else {
          const expression = jsonata(configValue.jsonata)
          queryParams[key] = expression.evaluate(flowMetadata)
        }
      }
    }

    return queryParams
  }
  getValidateStatus({ validateStatus }) {
    if (validateStatus && typeof validateStatus !== 'function') {
      throw new Error('validateStatus must be a function')
    }
    return validateStatus
  }
  // eslint-disable-next-line no-unused-vars
  async applyApiCall(data, step, globalState) {
    const { method, url: urlToUse, headers, params, data: reqBody, options = {}, name } = step
    const token = this.globalState.token ? this.globalState.token : ''

    // Resolve parameter values using resolveValue function
    const resolvedUrl = await this.resolveValue(urlToUse, this.globalState)
    const resolvedHeaders = await this.resolveValue(headers, this.globalState)
    const resolvedParams = await this.resolveValue(params, this.globalState)
    const resolvedReqBody = await this.resolveValue(reqBody, this.globalState)
    const resolvedOptions = await this.processParameters(options, this.globalState)

    // Set the authorization header if token is available
    if (token) {
      resolvedHeaders.Authorization = `Bearer ${token}`
    }
    const { validationRules } = resolvedOptions
    this.logger.trace({ method, resolvedHeaders, resolvedUrl, resolvedParams, resolvedReqBody, resolvedOptions, validationRules }, `Trying to make API call`)
    try {
    // Make the API call with Axios library
      const response = await this.axios({
        method,
        url: resolvedUrl,
        headers: resolvedHeaders,
        params: resolvedParams,
        data: resolvedReqBody,
        ...validationRules ? { validateStatus(status) {
          return validationRules[status.toString()] || validationRules['default'] || false
        } } : {},
        timeout: resolvedOptions.timeout,
        proxy: resolvedOptions.proxy,
      // ...httpsAgent ? { httpsAgent } : {},
      })

      const responseBody = {
        statusCode: response.status,
        headers: { ...response.headers.toJSON() },
        payload: response.data,
        duration: response.duration,
      }
      this.logger.debug({ responseBody }, `Result`)
      return responseBody
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        this.logger.error({ name, response: error.response.data }, `Axios Error Response`)
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        this.logger.error({ name, request: error.request }, `Axios Error Request`)
      } else {
        // Something happened in setting up the request that triggered an Error
        this.logger.error({ name, message: error.message }, `Axios Error`)
      }
      this.logger.debug({ config: error.config }, `Axios Error Details`)
      return { error }
    }
  }
}


function decorateResponseWithDuration(axiosInstance) {
  axiosInstance.interceptors.response.use(
    (response) => {
      response.config.metadata.endTime = new Date()
      response.duration = response.config.metadata.endTime - response.config.metadata.startTime
      return response
    },
    (error) => {
      error.config.metadata.endTime = new Date()
      error.duration = error.config.metadata.endTime - error.config.metadata.startTime
      return Promise.reject(error)
    }
  )

  axiosInstance.interceptors.request.use(
    (config) => {
      config.metadata = { startTime: new Date() }
      return config
    }, (error) => {
      return Promise.reject(error)
    })
}
module.exports = JsonDataProcessor
