const JsonPath = require("jsonpath");
const Velocity = require("velocityjs");
const jsonata = require("jsonata");
const url = require("url");
const queryString = require("querystring");
const axios = require("axios");
const fs = require("fs");
const cf = require("./custom-functions");

class JsonDataProcessor {
  constructor(config) {
    this.config = config;
    this.globalState = {};
  }

  async processData(inputData) {
    // this.globalState = { ...inputData };
    // this.globalState._originalInput = inputData;
    // this.globalState._currentStepOutput = inputData;

    for (let i = 0; i < this.config.steps.length; i++) {
      const step = this.config.steps[i];
      const stepName = step.name || `outputStep${i}`;

      let input;
      if (step.input === "original") {
        input = inputData;
      } else if (step.input === "previous") {
        input = this.globalState[stepName];
      } else {
        input = this.globalState[step.input] || inputData;
      }

      let outputData;
      this.logDebug(`Step ${i + 1} Input:`, input);
      switch (step.type) {
        case "jsonpath":
          outputData = await this.applyJSONPath(input, step);
          break;
        case "vtl":
          outputData = await this.applyVTL(input, step);
          break;
        case "custom":
          // New logic for custom function steps
          outputData = await this.applyCustomFunction(input, step);
          break;
        case "jsonata":
          outputData = await this.applyJSONata(input, step);
          break;
        case "url":
          outputData = await this.buildUrl(input, step);
          break;
        case "axios":
          outputData = await this.applyApiCall(input, step, this.globalState);
          break;

        default:
          throw new Error(`Unsupported step type: ${step.type}`);
      }

      this.logDebug(`Step ${i + 1} Output:`, this.globalState[stepName]);

      this.globalState[stepName] = outputData;
    }
    if (this.config.debug) {
      this.logDebug(
        `globalState Output:`,
        JSON.stringify(this.globalState, null, 4)
      );
    }
    return this.globalState;
  }
  logDebug(...args) {
    if (this.config.debug) {
      console.log(...args);
    }
  }
  validateConfig(config) {
    // Implement configuration validation here
  }

  validateInput(inputData) {
    // Implement input data validation here
  }
  escape(str) {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return str.replace(/[&<>"']/g, (match) => replacements[match]);
  }
  sanitize(obj) {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitize(item));
    }

    const cleanObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const cleanKey = this.escape(key);
        cleanObj[cleanKey] = this.sanitize(value);
      }
    }
    return cleanObj;
  }
  async resolveValue(value, globalState) {
    if (typeof value === "string" && value.startsWith("$.")) {
      return await JsonPath.value(globalState, value);
    } else {
      return value;
    }
  }

  async processParameters(parameters, globalState) {
    const processedParams = {};

    for (const [key, value] of Object.entries(parameters)) {
      if (typeof value === "string" && value.startsWith("$.")) {
        const queryResults = JsonPath.query(globalState, value);
        //     if (queryResults.length > 1) {
        //   processedParams[key] = queryResults;
        // } else {
        processedParams[key] = queryResults[0];
        // }
      } else {
        processedParams[key] = value;
      }
    }

    return processedParams;
  }

  applyCustomFunction(globalState, step) {
    // New logic for custom function steps
    const { function: customFunction, parameters } = step;
    const processedParams = this.processParameters(parameters, globalState);

    let result = cf[customFunction](processedParams);
    //   Object.keys(processedParams).forEach((key) => {
    //   if (Array.isArray(processedParams[key])) {
    //     var results=[]
    //     for(var i=0;i<processedParams[key].length;i++){
    //         const input={}

    //         input[key] = processedParams[key][i]
    //         results.push(cf[customFunction](input))
    //     }
    //     result = results

    //   } else {
    //     result = cf[customFunction](processedParams);
    //   }
    // })
    this.logDebug(`customFunction Result:`, result);
    this.globalState[step.outputKey] = result;
    return result;
  }

  applyJSONPath(data, step) {
    if (!step.query) {
      throw new Error("Missing query for JSONPath step");
    }
    const result = JsonPath.query(data, step.query);
    this.logDebug(`JSONPath Result:`, result);
    this.globalState[step.outputKey] = result;
    return result;
  }

  async applyVTL(data, step) {
    if (!step.template) {
      throw new Error("Missing template for VTL step");
    }
    const templateString = await this.loadTemplate(step.template);
    // const context = { data };
    var asts = Velocity.parse(templateString);
    const result = new Velocity.Compile(asts).render(data);

    try {
      const parsedResult = JSON.parse(result);
      this.globalState[step.outputKey] = parsedResult;
      return parsedResult;
    } catch (err) {
      this.globalState[step.outputKey] = result;
      return result;
    }
  }

  async loadTemplate(template) {
    if (template.type === "string") {
      return Array.isArray(template.content)
        ? template.content.join("\n")
        : template.content;
      // return template.content;
    } else if (template.type === "file") {
      const filePath = template.path;
      try {
        const content = await fs.readFileSync(filePath, "utf8");
        return content;
      } catch (error) {
        throw new Error(
          `Failed to load template from file "${filePath}": ${error.message}`
        );
      }
    } else {
      throw new Error(`Unsupported template type: ${template.type}`);
    }
  }
  async applyJSONata(data, step) {
    if (!step.expression) {
      throw new Error("Missing query for JSONPath step");
    }
    const expression = jsonata(step.expression);
    var result = await expression.evaluate(data);
    this.logDebug(`JSONPath Result:`, result);
    this.globalState[step.outputKey] = result;
    return result;
  }

  async buildUrl(flowMetadata, step) {
    const baseUrl = step.baseURL;
    const path = await this.buildPath(step.path, flowMetadata);
    const queryParams = await this.buildQueryParams(
      step.queryParams,
      flowMetadata
    );

    const urlString = url.format({
      protocol: step.protocol || "http",
      hostname: baseUrl,
      pathname: path,
      query: queryParams,
    });

    const result = urlString;
    this.logDebug(`JSONPath Result:`, result);
    this.globalState[step.outputKey] = result;
    return result;
  }

  async buildPath(pathConfig, flowMetadata) {
    const path = pathConfig.map(async (segment) => {
      if (typeof segment === "string") {
        return segment;
      }
      const expression = await jsonata(segment.jsonata);
      const query = await expression.evaluate(flowMetadata);
      if (query) {
        return query;
      }
      else{return null}
    });
    const result = (await Promise.all(path)).filter(Boolean).join('/')
    return result;
  }

  buildQueryParams(queryParamsConfig, flowMetadata) {
    const queryParams = {};

    for (const key in queryParamsConfig) {
      const configValue = queryParamsConfig[key];
      if (typeof configValue === "string") {
        queryParams[key] = configValue;
      } else {
        const expression = jsonata(configValue.jsonata);
        queryParams[key] = expression.evaluate(flowMetadata);
      }
    }

    return queryParams;
  }

  async applyApiCall(data, step, globalState) {
    const { method, url, headers, params, data: reqBody } = step;
    const token = this.globalState.token ? this.globalState.token : "" ;

    // Resolve parameter values using resolveValue function
    const resolvedUrl = await this.resolveValue(url, this.globalState);
    const resolvedHeaders = await this.resolveValue(headers, this.globalState);
    const resolvedParams = await this.resolveValue(params, this.globalState);
    const resolvedReqBody = await this.resolveValue(reqBody, this.globalState);

    // Set the authorization header if token is available
    if (token) {
      resolvedHeaders.Authorization = `Bearer ${token}`;
    }

    // Make the API call with Axios library
    const response = await axios({
      method,
      url: resolvedUrl,
      headers: resolvedHeaders,
      params: resolvedParams,
      data: resolvedReqBody,
    });

    // Filter the response with the filter step (if present)
    if (step.filter) {
      return applyFilter(response.data, step.filter, globalState);
    }

    const result = response.data;
    this.logDebug(`JSONPath Result:`, result);
    this.globalState[step.outputKey] = result;
    return result;
  }
}

module.exports = JsonDataProcessor;
