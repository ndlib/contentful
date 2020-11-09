# Contentful Apps

## Development
Use [create-contentful-app](https://github.com/contentful/create-contentful-app) to set up the shell of a new app. By default, the files are created as typescript code, but you can convert them to javascript if you wish.

You may also wish to delete the the package-lock file and use yarn instead. You may wish to set the port by prefixing the start script inside `package.json` like so: `PORT=3232 react-scripts start`

Simply run `yarn start` to begin development. If this is a new app, you will need to install an app definition which can either be done through the contentful UI or with the create-contentful-app CLI.

**Before deploying, you must set the homepage property in `package.json` to match the name of the your app directory. Otherwise, it will not be able to host the assets at the correct path!**

## Deployment

Our apps are hosted in S3. Run `deploy/cdk/deploy.sh [dev|prod]` in order to build all apps and publish them to the S3 bucket. (NOTE: Requires aws credentials, obviously. Assume role or run with aws-vault.)

Because Contentful requires apps to be served over HTTPS, we use CloudFront to serve up the S3 contents.

For new apps, you will need to update the app url after deployment. It should point to the index.html of the app directory on the CloudFront's domain. (Example: `https://dlkrzgaxopp4d.cloudfront.net/contentGrouping/index.html`) You can set this either through the Contentful UI, or by creating an app definition file and pushing it with the CLI.