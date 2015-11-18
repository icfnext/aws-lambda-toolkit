# aws-lambda-toolkit
A small library of AWS Lambda development tools to help make AWS Lambda development easier.

## Included functionality

- Automatic AWS Lambda deployment
- Local lambda testing

## @todo

- Add more in-depth documentation
- Creation of lambda function on first deployment
- Add unit tests
- Suggestions welcome!

## Installation:
```
npm install --save aws-lambda-toolkit
```

## Commands
---
### .deploy(config)

- config: object
    + secretKey: Your AWS Secret Key
    + accessKey: Your AWS Access Key
    + region: The AWS Region to use
    + name: The function name to use

### .test(config)

- config: object
    + entry: (optional) relative path to lambda file
        - If ommitted, the `main` prop in the package.json will be used.
    + tests: (optional) path to test file.
        - This will eventually just be a standard object, it's currently recommended to add the paths to your package.json and let it auto-load them.

## Sample usage
---
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
