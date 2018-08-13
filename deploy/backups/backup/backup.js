'use strict';
const AWS = require('aws-sdk');
const contentful = require('contentful-management');
const spaceExport = require('contentful-export');
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const hesburgh = require('@hesburgh-wse/hesburgh_utilities');
const heslog = hesburgh.heslog

exports.run = async (event, context, callback) => {
//async function foo() { // local testing

  //expects event obj formatted...
  // var event = { "backup": { "spaces": ['ecpq79ht7mvr'] }};
  // var context = {"addcon": "none"};

  await heslog.setHubContext('contentful')
  heslog.addContext(event.backup.spaces)
  heslog.addLambdaContext(event, context)

  /* retrieve parameter store values */
  let secrets;
  const bucketKey = '/all/contentful/production/backup/bucket';
  const bucketDirKey = '/all/contentful/production/backup/bucket_dir';
  const contentfulTokenKey = '/all/contentful/production/api/backup_token';
  try {
    const ssm = new AWS.SSM({region: "us-east-1"});
    const params = {
      Names: [
        bucketKey, bucketDirKey, contentfulTokenKey,
      ],
      WithDecryption: true
    };
    secrets = await ssm.getParameters(params).promise();
    heslog.info('Secrets retrieved');
  } catch (e) {
    heslog.error(e);
  }

  let bucket, bucketDir, contentfulToken;
  secrets.Parameters.forEach(function(element) {
    if(element.Name === bucketKey) {
      bucket = element.Value;
    } else if(element.Name === bucketDirKey) {
      bucketDir = element.Value;
    } else if(element.Name === contentfulTokenKey) {
      contentfulToken = element.Value;
    }
  });
  heslog.info('Secrets set');

  const exportTar = (new Date().toISOString() + "-" + event.backup.spaces[0] + ".tgz").replace(/[:]/g, "-");

  /* export backup, tar, and copy to S3 */
  if(bucket == null || bucketDir == null || contentfulToken == null) {
    heslog.addContext({'bucket':bucket, 'bucketDir':bucketDir})
    heslog.error('Contentful AWS parameters not set correctly');
  } else {
    try {
      await exec(`rm -rf /tmp/data`)
      await exec(`rm -rf /tmp/*.tgz`)
      await exec(`mkdir /tmp/data/`)
      
      const client = contentful.createClient({
        accessToken: contentfulToken,
      })
      let spaces = await client.getSpaces()
      let data = spaces.items.map(async (space) => {
        if (event.backup.spaces.indexOf(space.sys.id) > -1) {
          let options = {
              spaceId: space.sys.id,
              managementToken: contentfulToken,
              errorLogFile: `/tmp/data/${space}.txt`,
              downloadAssets: true,
              saveFile: true,
              includeDrafts: true,
              exportDir: '/tmp/data',
          }
          return spaceExport(options)
        }
      })
      await(Promise.all(data))
      heslog.info('Spaces exported');

      await exec(`tar czf /tmp/${exportTar} /tmp/data`);
      const buf = fs.readFileSync(`/tmp/${exportTar}`);
      const params = {
        Bucket  : bucket,
        Key     : `${bucketDir}/${exportTar}`,
        Body    : buf,
      }
      const S3 = new AWS.S3({
        region: "us-east-1",
        signatureVersion: 'v4',
      })
      let putPromise = await S3.putObject(params).promise();
      heslog.info('Export placed in S3');
    } catch (e) {
      heslog.addContext(params);
      heslog.error(e)
    }
  }

  /* verify backup file in S3 */
  try {
    const params = {
      Bucket: bucket,
      MaxKeys: 1,
      Prefix: `${bucketDir}/${exportTar}`,
    }
    const S3 = new AWS.S3({
      region: "us-east-1",
      signatureVersion: 'v4',
    })
    
    let content = await S3.listObjects(params).promise();
    if(content.Contents.length == 0) {
      heslog.addContext(params);
      heslog.error('No Contentful export backup file found in S3');
    } else {
      heslog.info('Verified export in S3')
    }
  } catch (e) {
    heslog.error(e)
  }
};

//foo(); //local testing