# Contentful Backup Process
These stacks are responsible for exporting data from the specified Contentful spaces, copying that data to an S3 bucket, and notifying devs if something should go wrong.

# Backup Space Input
To add/remove a space from the backup process edit the event in the lambda.yml and redeploy:
'{ "backup": { "spaces": ["nb1bvw5cwdnf"] }}'

# Configuration
The S3 bucket and directory to write the backups to are in AWS parameter store and can be changed without redeploy.
The contentful token to export data from our spaces is also stored there.
  * bucket - '/all/contentful/production/backup/bucket';
  * bucket dir = '/all/contentful/production/backup/bucket_dir';
  * contentful token = '/all/contentful/production/api/backup_token';