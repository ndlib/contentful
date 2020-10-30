import * as cdk from '@aws-cdk/core'
import {
  CloudFrontWebDistribution,
  OriginAccessIdentity,
  ViewerProtocolPolicy,
} from '@aws-cdk/aws-cloudfront'
import { Bucket } from '@aws-cdk/aws-s3'
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment'

export class ContentfulAppsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // All apps are stored in the same bucket to reduce the number of s3 buckets we need to use
    const bucket = new Bucket(this, 'ContentfulAppsBucket', {
      bucketName: `hesburgh-${this.account}-contentful-apps`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    // For giving cloudfront access to s3 bucket
    const cloudfrontOai = new OriginAccessIdentity(this, 'CloudfrontOAI')
    bucket.grantRead(cloudfrontOai)

    const cfDistribution = new CloudFrontWebDistribution(this, 'Distribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: bucket,
            originAccessIdentity: cloudfrontOai,
          },
          behaviors : [
            {
              isDefaultBehavior: true,
            },
          ],
        },
      ],
      defaultRootObject: '',
      errorConfigurations: [
        {
          errorCode: 404,
          errorCachingMinTtl: 86400,
          responseCode: 200,
          responsePagePath: '/index.html',
        },
        {
          errorCode: 403,
          errorCachingMinTtl: 86400,
          responseCode: 200,
          responsePagePath: '/index.html',
        },
      ],
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    })

    // Finally, deploy the built apps to the S3 bucket
    new BucketDeployment(this, 'BucketDeployment', {
      destinationBucket: bucket,
      sources: [
        Source.asset('../../apps/build'),
      ],
      // Invalidate CloudFront cache whenever app contents change
      distribution: cfDistribution,
    })
  }
}
