# deploy-aws-lambda

### Installation:
```
npm install --save deploy-aws-lambda
```

### Sample usage:
```
// Gulpfile

var gulp = require('gulp'),
    deployLambda = require('deploy-aws-lambda');

gulp.task('deploy-to-aws', function() {
    deployLambda({
        secretKey: 'SECRET_KEY',
        accessKey: 'ACCESS_KEY',
        region: 'REGION',
        name: 'LAMBDA_NAME'
    });
});
```