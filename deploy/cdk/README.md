# Contentful Apps Infrastructure

This project includes infrastructure necessary to deploy Contentful apps.

## Pre-requisites
Make sure to run `yarn install` on each subdirectory of "apps". Otherwise they will not deploy with the necessary node_modules.

## Deployment
Run `./deploy.sh` *instead of* `cdk deploy`. This will ensure that all of the apps are rebuilt before doing the deployment, since cdk does not have a way to hook in pre-deploy events if you use it directly.

NOTE: Each contentful app requires a "src" property to be configured pointing to the s3 bucket where the code lives. Make sure to set this for new apps, and update this for all apps if the bucket is every recreated.

## Useful commands

 * `yarn run build`   compile typescript to js
 * `yarn run watch`   watch for changes and compile
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
