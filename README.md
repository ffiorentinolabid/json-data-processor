# json-data-processor

const JsonDataProcessor = require('./json-data-processor');
const config = require('./files/config2.json');
const inputData = require('./files/input-data2.json');

const input2 = {
  number1: 10,
  number2: 20,
  greeting: "Hello, World!"
};

const config2 = {
  debug: true,
  steps: [
    {
      type: "custom",
      function: "uppercase",
      parameters: {
        str: "$.greeting"
      },
      outputKey: "uppercaseGreeting"
    },
    {
      type: "custom",
      function: "add",
      parameters: {
        value1: "$.number1",
        value2: "$.number2"
      },
      outputKey: "sum"
    },
    {
      type: "custom",
      function: "concat",
      parameters: {
        str1: "$.greeting",
        str2: " Have a great day!"
      },
      outputKey: "fullGreeting"
    }
  ]
};
const input = {
  greeting: "Hello, World!",
  number1: 10,
  number2: 20,
  token: '123',
  userId:"user1",
  transactionId:"6789"

};

const configuration = {
  debug: true, steps: [

    {
      type: "jsonata",
      expression: "$uppercase(greeting)",
      outputKey: "uppercaseGreeting2"
    },
    {
      type: "jsonata",
      expression: "number1 + number2",
      outputKey: "token"
    },
    {
      type: "jsonata",
      expression: "greeting & ' Have a great day!'",
      outputKey: "fullGreeting2"
    },
    {
      type: "url",
      baseURL: "example.com",
      path: ['api', 'v1', { jsonata: '$.userId' }, { jsonata: '$.transactionId' }],
      query: {
        staticValue: 'static',
        dynamicValue: { jsonata: '$.someValue' },
        param1: { jsonata: "$.step1Output" },
        param2: { jsonata: "$.step2Output" },
      },
      protocol: "https"
    },
    {
      type: "axios",
      method: "get",
      url: "$.outputStep3",
      headers: {
        Authorization: "Bearer $.token"
      },
      responseFilters: [
        {
          type: "jsonpath",
          query: "$.data"
        }
      ]
    }
  ]
};

// const processor1 = new JsonDataProcessor(config);
// processor1.processData(inputData)
// .then((result)=>{
//     console.log(JSON.stringify(result,null,4))
// })
// .catch((err)=>{
//     console.log(err)
// })

const processor2 = new JsonDataProcessor(configuration);
processor2.processData(input)
  .then((result) => {
    console.log(JSON.stringify(result, null, 4))
  })
  .catch((err) => {
    console.log(err)
  })

// const processor3 = new JsonDataProcessor(config2);
// processor3.processData(input2)
//   .then((result) => {
//     console.log(JSON.stringify(result, null, 4))
//   })
//   .catch((err) => {
//     console.log(err)
//   })