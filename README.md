# JsonDataProcessor Library README

`JsonDataProcessor` is a flexible and extensible library designed to process and transform JSON data by applying a series of configured steps. The library supports various transformations including JSONPath, VTL (Velocity Template Language), JSONata, URL building, and more.

## Table of Contents
1. [Installation](#installation)
2. [Usage](#usage)
3. [Configuration](#configuration)
   * [Steps Configuration](#steps-configuration)
   * [Logging Configuration](#logging-configuration)
4. [Examples](#examples)
5. [Custom Functions](#custom-functions)
6. [License](#license)

## Installation

You can install the `JsonDataProcessor` library via npm:

```bash
npm install json-data-processor
```

## Usage

To use the `JsonDataProcessor`, you'll need to:

1. Import the necessary dependencies
2. Create an instance of `JsonDataProcessor` by passing in a configuration object.
3. Call the `processData` function on the instance with the input data you want to process.

```javascript
const JsonDataProcessor = require('json-data-processor');

const config = {
    // Your configuration here...
};

const processor = new JsonDataProcessor(config);

const inputData = {
    // Your input JSON data...
};

const result = await processor.processData(inputData);
```

## Configuration

The configuration object passed to `JsonDataProcessor` determines how the input data will be processed. This configuration primarily consists of an array of steps, each representing a specific type of transformation or action.

### Steps Configuration

Each step in the configuration should specify:

- **type**: Type of the step, e.g., 'jsonpath', 'vtl', 'custom', 'jsonata', 'url', 'axios'.
- **name**: (Optional) Name of the step. If omitted, defaults to `outputStep{i}`.
- **input**: Determines the input for this step. Can be 'original' (original input), 'previous' (output of the last step), or the name of a specific previous step.
- **outputKey**: The key under which the result of this step will be stored in the global state.
- **output**: (Optional) If set to 'global', the global state will be reset.

There are specific parameters required for each type of step, like `query` for JSONPath, `template` for VTL, etc.

### Logging Configuration

The library uses the `pino` logger, and its configuration can be passed via the `logLevel` key. Supported log levels are 'trace', 'debug', 'info', etc.

## Examples

### 1. Applying a JSONPath Transformation:

```javascript
const config = {
    logLevel: 'info',
    steps: [
        {
            type: 'jsonpath',
            input: 'original',
            query: '$.items[0]',
            outputKey: 'firstItem'
        }
    ]
};

// Assuming input data is:
// {
//   "items": ["apple", "banana", "cherry"]
// }

// The result will be:
// {
//   "firstItem": "apple"
// }
```

### 2. Building a URL:

```javascript
const config = {
    logLevel: 'info',
    steps: [
        {
            type: 'url',
            baseURL: 'example.com',
            path: ['products', { jsonata: '$.productId' }],
            outputKey: 'productURL'
        }
    ]
};

// Assuming input data is:
// {
//   "productId": "123"
// }

// The result will be:
// {
//   "productURL": "http://example.com/products/123"
// }
```

## Custom Functions

The library also supports custom functions, which can be either:

1. Directly passed as a function.
2. Referred to by name, in which case the function should exist in the `custom-functions` module.

```javascript
const config = {
    logLevel: 'info',
    steps: [
        {
            type: 'custom',
            function: 'myCustomFunction', // this refers to a function in the custom-functions module
            outputKey: 'customOutput'
        }
    ]
};
```
---

## License

This library is licensed under the MIT License. See `LICENSE` file for details.
