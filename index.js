/* eslint-disable no-console */
'use strict'

const JsonDataProcessor = require('./json-data-processor')


// const input = {
//   greeting: 'Hello, World!',
//   number1: 10,
//   number2: 20,
//   token: '123',
//   userId: 'user1',
//   transactionId: '6789',
//   'uids': 'E0167801183E2E87',

// }

// const configuration = {
//   debug: true,
//   steps: [

//     {
//       type: 'jsonata',
//       expression: 'uids',
//       outputKey: 'uppercaseGreeting2',
//     },
//     {
//       type: 'jsonata',
//       expression: 'number1 + number2',
//       outputKey: 'token',
//     },
//     {
//       type: 'jsonata',
//       expression: "greeting & ' Have a great day!'",
//       outputKey: 'fullGreeting2',
//     },
//     // {
//     //   type: 'custom',
//     //   function: 'uppercase',
//     //   parameters: {
//     //     key: '$.greeting',
//     //   },
//     //   outputKey: 'uppercaseGreeting',
//     // },
//     {
//       type: 'custom',
//       function: (foo) => { return Buffer.from(foo.key, 'hex').toString('base64') },
//       parameters: {
//         key: '$.uids',
//       },
//       outputKey: 'uidBase64',
//     },
//   ],
// }

// // const processor1 = new JsonDataProcessor(config);
// // processor1.processData(inputData)
// // .then((result)=>{
// //     console.log(JSON.stringify(result,null,4))
// // })
// // .catch((err)=>{
// //     console.log(err)
// // })

// const processor2 = new JsonDataProcessor(configuration)
// processor2.processData(input)
//   .then((result) => {
//     console.log(JSON.stringify(result, null, 4))
//   })
//   .catch((error) => {
//     console.log(error)
//   })

// const inputAuth = {
//   tapParams: {
//     uid: 'E0167801183E2E87',
//     counter: 1,
//     cmac: '1234567890',
//   },
// }
// const inputAuth2 = {
//   '@odata.context': "https://prodottisearchweb.search.windows.net/indexes('productsimages-index')/$metadata#docs(*)",
//   'value': [
//     {
//       '@search.score': 1573.5903,
//       'metadata_storage_name': '471508-12FT20--F.jpg',
//       'metadata_storage_path': 'https://storageaccountinstobb6a.blob.core.windows.net/instore-container/productpics/471508-12FT20--F.jpg',
// eslint-disable-next-line max-len
//       'index_key': 'aAB0AHQAcABzADoALwAvAHMAdABvAHIAYQBnAGUAYQBjAGMAbwB1AG4AdABpAG4AcwB0AG8AYgBiADYAYQAuAGIAbABvAGIALgBjAG8AcgBlAC4AdwBpAG4AZABvAHcAcwAuAG4AZQB0AC8AaQBuAHMAdABvAHIAZQAtAGMAbwBuAHQAYQBpAG4AZQByAC8AcAByAG8AZAB1AGMAdABwAGkAYwBzAC8ANAA3ADEANQAwADgALQAxADIARgBUADIAMAAtAC0ARgAuAGoAcABnAA2',
//     },
//     {
//       '@search.score': 1535.918,
//       'metadata_storage_name': '471508-12FT20--E.jpg',
//       'metadata_storage_path': 'https://storageaccountinstobb6a.blob.core.windows.net/instore-container/productpics/471508-12FT20--E.jpg',
// eslint-disable-next-line max-len
//       'index_key': 'aAB0AHQAcABzADoALwAvAHMAdABvAHIAYQBnAGUAYQBjAGMAbwB1AG4AdABpAG4AcwB0AG8AYgBiADYAYQAuAGIAbABvAGIALgBjAG8AcgBlAC4AdwBpAG4AZABvAHcAcwAuAG4AZQB0AC8AaQBuAHMAdABvAHIAZQAtAGMAbwBuAHQAYQBpAG4AZQByAC8AcAByAG8AZAB1AGMAdABwAGkAYwBzAC8ANAA3ADEANQAwADgALQAxADIARgBUADIAMAAtAC0ARQAuAGoAcABnAA2',
//     }] }
const inputAuth = {
  'product_list': [
    {
      '_id': '69282155de12b02f42579a9e',
      'value': 'fortnite',
    },
    {
      '_id': '695243cf7c0f5e55666e8ea0',
      'value': 'starbucks',
    },
    {
      '_id': '690e26c4fc16f7a423cc8369',
      'value': 'tractorSupply',
    },
  ],
  '_id': '699816ee45e8a7a3fcf4b268',
  'requestId': 'bc90eaaa-1bd9-41f4-ad16-99b03ac7c9fb',
  'originUrl': '/nfc?v=0&t=0AE268568F32E7BF767A214DE7C3EFECD16E152F564C27A0',
  'redirectUrl': 'https://test.liars.io/public/giftcards/starbucks.html?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmbG93SWQiOiI2OTk4MTZlZTg0ZGNkNTgxOTI4YTBhMTgiLCJwaW4iOiI2MDE4NzY0MiIsInNlcmlhbCI6IjA0NDkzRkZBQTk2MTgwIiwiaW50ZXJhY3Rpb25Db3VudGVyIjoyOSwiY3JlZGl0IjoiMTAwIiwiYWN0aXZhdGlvbl9kYXRlIjoiMjAyNS0wNS0yMSIsImV4cGlyZV9kYXRlIjoiMjAyNS0xMi0zMSIsInNrdSI6InN0YXJidWNrcyIsInBheW1lbnRfbWV0aG9kcyI6W3sibmFtZSI6IkNyZWRpdENhcmQiLCJpY29uIjoiZmEtc29saWRmYS1jcmVkaXQtY2FyZCIsInVybCI6IiMifSx7Im5hbWUiOiJQYXlQYWwiLCJpY29uIjoiZmEtYnJhbmRzZmEtcGF5cGFsIiwidXJsIjoiIyJ9LHsibmFtZSI6IkFwcGxlUGF5IiwiaWNvbiI6ImZhLWJyYW5kc2ZhLWFwcGxlLXBheSIsInVybCI6IiMifSx7Im5hbWUiOiJHb29nbGVQYXkiLCJpY29uIjoiZmEtYnJhbmRzZmEtZ29vZ2xlLXBheSIsInVybCI6IiMifV0sImNhcmRfZ3JhZGllbnQiOiJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjMUUzOTMyIDAlLCAjMDA3NTRBIDM1JSwgIzAwNjI0MSA2NSUsICMxRTM5MzIgMTAwJSkiLCJwcmltYXJ5X2NvbG9yIjoiIzAwNzU0QSIsInNlY29uZGFyeV9jb2xvciI6IiMxRTM5MzIiLCJnb2xkX2NvbG9yIjoiI0NCQTI1OCIsImxvZ29fdXJsIjoiL3B1YmxpYy9naWZ0Y2FyZHMvbG9nb3Mvc3RhcmJ1Y2tzLnN2ZyIsImlhdCI6MTc3MTU3NTAyMiwibmJmIjoxNzcxNTc1MDIyLCJleHAiOjE3NzE1NzUwNTJ9.N4d8QGK1Q7bORaMqN7vUQtJ0VQ8sBu_QVtOjWywvAIg',
  'events': [
    '__startEvent__',
    'DECRYPT_REQUIRED',
    'DECRYPTED',
    'TAG_COMMISSIONED_AUTH_REQ',
    'AUTHENTICATION_OK',
    'VALIDATION_OK',
    'CHECK_CAMPAIGN',
    'BASE_REDIRECT',
  ],
  'businessEvents': [
    'IR_OK',
    'AUTH_OK',
    'VAL_OK',
  ],
  'success': true,
  'tagUid': '04493FFAA96180',
  'itemId': '693c39d87c0f5e55666e1805',
  'productId': '695243cf7c0f5e55666e8ea0',
  'brandId': '67d156a3820e8fb508807c06',
  'countryName': 'Italy',
  'countryCode': 'IT',
  'regionName': 'Emilia-Romagna',
  'cityName': 'Bologna',
  'sourceHost': 'giftcards.prp.urely.io',
  'nfcCounter': 109,
  'tagState': '67d156a3820e8fb508807c0c',
  'itemState': '67d16f4f820e8fb508807c3d',
  'hostIp': '93.70.86.92',
  'additionalParameters': {
    'cardInfo': {
      'credit': '100',
      'activation_date': '2025-05-21',
      'expire_date': '2025-12-31',
      'payment_methods': [
        {
          'name': 'CreditCard',
          'icon': 'fa-solidfa-credit-card',
          'url': '#',
        },
        {
          'name': 'PayPal',
          'icon': 'fa-brandsfa-paypal',
          'url': '#',
        },
        {
          'name': 'ApplePay',
          'icon': 'fa-brandsfa-apple-pay',
          'url': '#',
        },
        {
          'name': 'GooglePay',
          'icon': 'fa-brandsfa-google-pay',
          'url': '#',
        },
      ],
      'promos': [
        {
          'title': '10%extraonyournextGiftCard!',
          'url': 'https://beontag-rgca.my.canva.site/beontag',
        },
        {
          'title': '2x1SummerCards',
          'url': 'https://beontag-rgca.my.canva.site/beontag',
        },
        {
          'title': 'DigitalPromo:TopupviaApp',
          'url': 'https://beontag-rgca.my.canva.site/beontag',
        },
      ],
    },
  },
  'acceptLanguage': 'en-GB,en-US;q=0.9,en;q=0.8',
  'geolocation': {
    'type': 'Point',
    'coordinates': [
      11.34262,
      44.49489,
    ],
  },
  'tapTimestamp': '2026-02-20T08:10:22.114Z',
  'userAgent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
  'browserName': 'Chrome',
  'browserVersion': '145.0.0.0',
  'browserMajor': '145',
  'engineName': 'Blink',
  'engineVersion': '145.0.0.0',
  'osName': 'Mac OS',
  'osVersion': '10.15.7',
  'deviceVendor': 'Apple',
  'deviceModel': 'Macintosh',
  'sagaId': 'flow-default_67d156a3820e8fb508807c06_20260220T081022198Z_029e1',
  'redirectionRuleId': '695244967c0f5e55666e8ea5',
  'tapDuration': 692,
  '__STATE__': 'PUBLIC',
  'creatorId': 'public',
  'updaterId': 'public',
  'updatedAt': '2026-02-20T08:10:22.827Z',
  'createdAt': '2026-02-20T08:10:22.827Z',
}
// const configAuth = {
//   logLevel: 'info',
//   steps: [

//     {
//       type: 'jsonata',
//       expression: '\'foo\'',
//       outputKey: 'body.user',
//     },
//     {
//       type: 'jsonata',
//       expression: 'tapParams.uid',
//       outputKey: 'body.uid',
//     },
//     {
//       type: 'jsonata',
//       expression: 'tapParams.counter & tapParams.cmac',
//       outputKey: 'body.tac',
//     },
//     {
//       type: 'jsonata',
//       expression: '123456',
//       outputKey: 'headers.x-api-key',
//     },
//     {
//       type: 'axios',
//       method: 'POST',
//       url: 'https://webhook.site/f9280d5d-eb88-4ab4-8d14-4802ea478a9f',
//       data: '$.body',
//       headers: '$.headers',
//       outputKey: 'response',
//       options: { validationRules: { '200': true, '400': true, 'default': false } },
//     },
//     {
//       type: 'jsonata',
//       input: 'previous',
//       expression: 'statusCode != 200 ? {\'event\':\'error\'} : \
//       payload.original = true ? {\'event\':\'original\'} : \
//       {\'event\':\'notoriginal\'}',
//       outputKey: 'return',
//     },
//   ],
// }

const configAuth2
  = {
    'logLevel': 'info',
    'steps': [
      {
        'type': 'jsonata',
        'expression': '( $pid := productId; $currentIdx := product_list#$i[_id = $pid].($i); $nextIdx := ($currentIdx + 1) % $count(product_list); product_list[$nextIdx].value )',
        'outputKey': 'calculatedValue',
      },
      {
        'type': 'jsonata',
        'expression': 'itemState in ["foo", "bar", "bat"]',
        'outputKey': 'isTargetState',
      },
    ],
  }
const processor3 = new JsonDataProcessor(configAuth2)
processor3.processData(inputAuth)
  .then((result) => {
    console.log(JSON.stringify(result, null, 4))
  })
  .catch((error) => {
    console.log(error)
  })

// const processor4 = new JsonDataProcessor(configAuth2)
// processor4.processData(inputAuth2)
//   .then((result) => {
//     console.log(JSON.stringify(result, null, 4))
//   })
//   .catch((error) => {
//     console.log(error)
//   })
