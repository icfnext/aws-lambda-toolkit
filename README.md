# aws-lambda-toolkit [![NPM Version][npm-image]][npm-url]
A small library of AWS Lambda development tools to help make AWS Lambda development easier.

## Included functionality

- Automatic AWS Lambda deployment
- Local lambda testing

## @todo

- ~~Creation of an .rc file that will house the AWS config settings while being omitted by source control~~
- ~~Creation of lambda function on first deployment~~
- Suggestions welcome!

## Gotchas

- Due to some limitations with injecting the AWS configuration into the lambda, when using `aws-sdk` calls within your lambda you are required to manually set the region via the global config object at the top of your lambda file:
    ```
    var AWS = require('aws-sdk');
    AWS.config.region = 'REGION';
    ```
    This is a known issue ([1](https://github.com/Tim-B/grunt-aws-lambda/issues/18), [2](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html#Setting_the_Region)) due to the SDK not pulling in the region automatically (like it does the secret/access keys), but due to the complexity of creating a workaround it's been backlogged for the moment.
- This toolkit is meant to be used in conjunction with the [AWS cli](https://aws.amazon.com/cli/). By default, and without passing in any secret or access key, the module will be given the secret/access keys from your global config set by the AWS cli. If you don't have the [AWS cli](https://aws.amazon.com/cli/) and are concerned about including your credentials in version control you can toss them into a `.awscredentials.json` file and then add the file into your `.gitignore` file.

## Installation
```
npm install --save aws-lambda-toolkit
touch .awstoolkitconfig.json
```

## Configuration
### `.awstoolkitconfig.json` File
The configuration file can vary depending on the status of the lambda you're working on. If the lambda is already created and set up within AWS, it can be fairly lightweight and only contain a region, function name and test data. If you're starting from scratch you'll need to add a little bit more, but the process is streamlined and only requires the parameters required by the AWS SDK (aside from ones that are trivial and never change).

```
{
    "name": "lambda-toolkit-example",
    "handler": "index.handler",
    "region": "us-east-1",
    "role": "arn:aws:iam::123456789101:role/lambda-example",
    "description": "A really cool lambda that does awesome stuff.",
    "publish": true,
    "ignores" : [
        "testing"
    ],
    "tests" : {
        "success": "testing/success.json",
        "fail-missingEmail": "testing/fail-missingEmail.json"
    }
}
```

**Available properties:**

- `name`: **Required for all deployment/creation.** Your lambdas function name (`your-cool-lambda`).
- `region`: **Required for all deployment/creation.** The region you want to use for AWS.
- `handler`: **Required for lambda creation.** The handler for your function. Essentially its your JS file with `.handler` on the end of it (`yourjsfile.handler`).
- `role`: **Required for lambda creation.** The role arn you want to use to specify permissions for your lambda.
- `description`: **Optional.** The description you want to add for this lambda to easily discern what it does in the AWS control panel.
- `publish`: **Optional.** Whether to publish a new version of your lambda every deployment or not.
- `ignores`: **Optional.** An array of paths to ignore when bundling up the lambdas source.
- `tests`: **Optional.** An object containing test identifiers (key) and paths to test JSON request data (value). Ex:
`{ "testname" : "pathto/test.json" }`

### Optional `.awscredentials.json` File
As mentioned in the _Gotchas_ section, the credentials file is only really necessary if you're not using the AWS CLI to manage your credentials. It's just a simple JSON file with your secret and access keys that can be ignored via version control to prevent compromising your credentials.

```
{
    "accessKey" : "YOURACCESSKEY",
    "secretKey" : "YOURSECRETKEY"
}
```

**Available properties:**

- `accessKey` : **Required.** Your AWS access key.
- `secretKey` : **Required.** Your AWS secret key.

## Commands
### .deploy(config)

- config: object
    + secretKey: (optional) Your AWS Secret Key
    + accessKey: (optional) Your AWS Access Key
    + region: (optional) The AWS Region to use
    + name: (optional) The function name to use
    + publish: (optional) Whether to publish a new version

The `.deploy()` method will take your code, bundle it up into a fancy fresh zip file, and upload it to AWS. If the function/lambda doesn't already exist, the method will auto-create it as long as all of the required properties inside of the configuration file are set up. Alternatively, you can pass in an object with any property you'd like to be tacked into the config before creation. This is useful for dynamic lambda creation.

### .test(config)

- config: object
    + entry: (optional) relative path to lambda file
        - If omitted, the `main` prop in the `.awstoolkitconfig.json` will be used.
    + tests: (optional) path to test file.
        - This will eventually just be a standard object, it's currently recommended to add the paths to your `.awstoolkitconfig.json` and let it auto-load them.

The `.test()` method will allow you to run test requests against your Lambda on your local machine. It will emulate the lambda on a local Node server and run any tests provided (via parameters or the `.awstoolkitconfig.json` file) by sending the test data to the server as requests. Once sent, your lambda will do what it does and once terminated the test runner will output the results to the console so you can quickly verify your lambda is working.

## Sample usage
#### Sample Gulp usage

1. Install modules.
    ```
    $ npm install --save aws-lambda-toolkit gulp
    ```
2. Create an `.awstoolkitconfig.json` file:
    ```
    {
        "name": "lambda-toolkit-example",
        "handler": "index.handler",
        "region": "us-east-1",
        "role": "arn:aws:iam::123456789101:role/lambda-example",
        "description": "A really cool lambda that does awesome stuff.",
        "ignores" : [
            "testing"
        ],
        "tests" : {
            "success": "testing/success.json",
            "fail-missingEmail": "testing/fail-missingEmail.json"
        }
    }
    ```
3. Create some test data (sample `testing/success.json`):
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

    gulp.task('deploy-to-aws', function () {
        lambdaToolkit.deploy();
    });

    gulp.task('publish-lambda', function () {
        lambdaToolkit.deploy({
          publish: true
        });
    });

    gulp.task('test-lambda', function () {
        lambdaToolkit.test();
    });
    ```
5. Run `gulp test-lambda` to have the module fire up your lambda and shoot the test requests over to it.
6. Run `gulp deploy-to-aws` to deploy your lambda
7. Run `gulp publish-lambda` to publish the lambda with a new version



#### Sample NPM Usage
1. Install the module `npm install --save aws-lambda-toolkit`
2. Create an `.awstoolkitconfig.json` file:
    ```
    {
        "name": "lambda-toolkit-example",
        "handler": "index.handler",
        "region": "us-east-1",
        "role": "arn:aws:iam::123456789101:role/lambda-example",
        "description": "A really cool lambda that does awesome stuff.",
        "ignores" : [
            "testing"
        ],
        "tests" : {
            "success": "testing/success.json",
            "fail-missingEmail": "testing/fail-missingEmail.json"
        }
    }
    ```
3. Create some test data (sample `testing/success.json`):
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
        // If not using a .awscredentials.json file or aws-cli config
        lambdaToolkit.deploy({
            secretKey: 'SECRET_KEY',
            accessKey: 'ACCESS_KEY'
        });
    }

    if (process.argv[process.argv.length - 1] === 'publish') {
        // If using .awscredentials.json file
        lambdaToolkit.deploy({
          publish: true
        });
    }

    if (process.argv[process.argv.length - 1] === 'test') {
        lambdaToolkit.test();
    }
    ```
5. Add your task scripts to `package.json`:
    ```
    {
        "scripts" : {
            "publish" : node tasks.js publish",
            "deploy" : "node tasks.js deploy",
            "test" : "node tasks.js test"
        }
    }
    ```
    _Alternatively, you can skip this step (and the next steps) and just run `node tasks.js deploy` from your project root._
6. Test your lambda via `npm run test`
7. Deploy your lambda via `npm run deploy`

## Contact
Feel free to open PR's, issues, or contact me with any questions/concerns. This was built to speed up development of some internal POC's utilizing AWS lambdas over at [ICF Olson](http://icfolson.com/).

## Changelog
### v0.1.1
- Added `publish` property to config and `.deploy()` parameters to avoid 80000321.7 different versions of lambdas.

### v0.1.0
- Addition of the `.awstoolkitconfig.json` configuration file. Refactoring of deployment/testing modules to accommodate.
- Added `.awscredentials.json` credentials file so credentials can be ignored via version control.
- Updated deployment module to create lambda functions via the AWS SDK if the lambda does not already exist on AWS.

### v0.0.10
- Updated context emulator to only fire a scripts context once (you no longer have to `return` a context event for it to terminate the request... doh)
- Fixed an issue where it would run tests numerous times based on the current index of the test being run (if you were running the 3rd test it would display the results 3 times rather than just once)
- All npm modules listed as `devDependencies` will be ignored when bundling up the lambda file for deployment
- Some minor test runner formatting changes
- Fixed typo in readme that would cause errors if the example `tasks.js` script was used

[npm-url]: https://www.npmjs.com/package/aws-lambda-toolkit
[npm-image]: https://img.shields.io/npm/v/aws-lambda-toolkit.svg?style=flat-square
