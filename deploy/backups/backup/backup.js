'use strict';
const AWS = require('aws-sdk');
const contentful = require('contentful-management');
const spaceExport = require('contentful-export');
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const key = (new Date().toISOString() + ".tgz").replace(/[:]/g, "-")

exports.run = async (event, context, callback) => {
//async function foo() { // local testing

  /* expects event obj formatted...
  * var event = { "backup": { "spaces": ['nb1bvw5cwdnf'] }};
  */

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
    console.log('Secrets retrieved');
  } catch (e) {
    err_msg = e;
    console.log(e);
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
  console.log('Secrets set');

  let err_msg;

  /* export backup, tar, and copy to S3 */
  if(bucket == null || bucketDir == null || contentfulToken == null) {
    err_msg = 'Contentful AWS parameters not set correctly';
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
      console.log('Spaces exported');

      await(Promise.all(data))

      await exec(`tar czf /tmp/${key} /tmp/data`)
      let params = {
        Bucket  : bucket,
        Key     : `${bucketDir}/${key}`,
        Body    : fs.readFileSync(`/tmp/${key}`),
      }
      const S3 = new AWS.S3({
        region: "us-east-1",
        signatureVersion: 'v4',
      })
      await S3.putObject(params).promise()
      console.log('Export placed in S3')
    } catch (e) {
      err_msg = e;
      console.log(e)
    }
  }

  /* verify backup file in S3 */
  try {
    if(err_msg == null) {
      const S3 = new AWS.S3({
        region: "us-east-1",
        signatureVersion: 'v4',
      })
      let backupFileDetails = {
        Bucket: bucket,
        MaxKeys: 1,
        Prefix: `${bucketDir}/${key}`
      }
      const content = await S3.listObjects(backupFileDetails).promise();
      if(content.Contents.length == 0) {
        err_msg = 'No Contentful export backup file found';
      }
    }
  } catch (e) {
    console.log(e)
  }

  /* if errors then send notifications */
  if(err_msg) {
    try {
      const sns = new AWS.SNS({region: "us-east-1"});
      const topics = await sns.listTopics().promise();
      let topic;
      topics.Topics.forEach(function(element) {
        if(element.TopicArn.endsWith('backSpace')) {
          topic = element.TopicArn
        }
      });
      const notify = {
        Message: JSON.stringify(err_msg),
        Subject: 'Contentful Backup Failure',
        TopicArn: topic
      };
      await sns.publish(notify).promise();
    } catch (e) {
      console.log(e)
    }
  }
};

//foo() //local testing