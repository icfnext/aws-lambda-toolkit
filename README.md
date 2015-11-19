# aws-lambda-toolkit
A small library of AWS Lambda development tools to help make AWS Lambda development easier.

## Included functionality

- Automatic AWS Lambda deployment
- Local lambda testing

## @todo

- Add more in-depth documentation
- Refactor of test setup
- Creation of an .rc file that will house the AWS config settings while being omitted by source control
- Creation of lambda function on first deployment
- Add unit tests
- Suggestions welcome!

## Gotchas

- Due to some limitations with injecting the AWS configuration into the lambda, when using `aws-sdk` calls within your lambda you are required to manually set the region via the global config object at the top of your lambda file:
    ```
    var AWS = require('aws-sdk');
    AWS.config.region = 'REGION';
    ```
    This is a known issue ([1](https://github.com/Tim-B/grunt-aws-lambda/issues/18), [2](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html#Setting_the_Region)) due to the SDK not pulling in the region automatically (like it does the secret/access keys), but due to the complexity of creating a workaround it's been backlogged for the moment.
- This toolkit is meant to be used in conjunction with the [AWS cli](https://aws.amazon.com/cli/). By default, and without passing in any secret or access key, the module will be given the secret/access keys from your global config set by the AWS cli. If you are worried about including your keys in source control, it is highly recommended you store them globally via the AWS cli. This will be remedied in the future via an _.rc_ configuration file.

## Installation:
```
npm install --save aws-lambda-toolkit
```

## Commands
### .deploy(config)

- config: object
    + secretKey: (optional) Your AWS Secret Key
    + accessKey: (optional) Your AWS Access Key
    + region: The AWS Region to use
    + name: The function name to use

### .test(config)

- config: object
    + entry: (optional) relative path to lambda file
        - If omitted, the `main` prop in the package.json will be used.
    + tests: (optional) path to test file.
        - This will eventually just be a standard object, it's currently recommended to add the paths to your package.json and let it auto-load them.

## Sample usage
#### Sample Gulp usage

1. Install modules.
    ```
    $ npm install --save aws-lambda-toolkit gulp
    ```
2. Add paths for test data to `package.json`:
    ```
    "lambdatests": {
        "successful": "testdata/success.json",
        "fail": "testdata/fail.json",
        "no-user-id": "testdata/no-user-id.json"
    }
    ```
3. Create some test data (sample `testdata/success.json`):
    ```
    {
        "userId" : "12345678",
        "userEmail" : "cool.dude@host.com"
    }
    ```
4. Create a `gulpfile.js`:
    ```
    var gulp = require('gulp'),
        lambdaToolkit = require('aws-lambda-toolkit');

    gulp.task('deploy-to-aws', function() {
        lambdaToolkit.deploy({
            secretKey: 'SECRET_KEY',
            accessKey: 'ACCESS_KEY',
            region: 'REGION',
            name: 'FUNCTION_NAME'
        });
    });

    gulp.task('test-lambda', function() {
        lambdaToolkit.test();
    });
    ```
5. Run `gulp test-lambda` to have the module fire up your lambda and shoot the test requests over to it.
6. Run `gulp deploy-to-aws` to deploy your lambda



#### Sample NPM Usage
1. Install the module `npm install --save aws-lambda-toolkit`
2. Add paths for test data to `package.json`:
    ```
    "lambdatests": {
        "successful": "testdata/success.json",
        "fail": "testdata/fail.json",
        "no-user-id": "testdata/no-user-id.json"
    }
    ```
3. Create some test data (sample `testdata/success.json`):
    ```
    {
        "userId" : "12345678",
        "userEmail" : "cool.dude@host.com"
    }
    ```
4. Create a task file (ex. `tasks.js`):
    ```
    var lambdaToolkit = require('aws-lambda-toolkit');

    if (process.argv[process.argv.length - 1] === 'deploy') {
        lambdaToolkit.deploy({
            secretKey: 'SECRET_KEY',
            accessKey: 'ACCESS_KEY',
            region: 'REGION',
            name: 'FUNCTION_NAME'
        });
    }

    if (process.argv[process.argv.length - 1] === 'test') {
        deployAwsLambda.test();
    }
    ```
5. Add your deployment scripts to `package.json`:
    ```
    {
        "scripts" : {
            "deploy" : "node tasks.js deploy",
            "test" : "node tasks.js test"
        }
    }
    ```
    _Alternatively, you can skip this step (and the next steps) and just run `node tasks.js deploy` from your project root._
6. Test your lambda via `npm run test`
7. Deploy your lambda via `npm run deploy`

## Contact
Feel free to open PR's, issues, or contact me with any questions/concerns. This was built to speed up development of some internal POC's utilizing AWS lambdas over at [ICF Interactive](http://icfi.com/interactive).
