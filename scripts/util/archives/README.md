# Import data into Archives Space
## Introduction
This process allows for the setup and import of data into the archive space.  If the archive space already has the necessary content types you can run just the import process to add additional record types.  A sample record type import csv - Records_Data_Test.csv

Iff you're starting from an empty space these content types and content will be created from a backup...
| CONTENT_TYPE        | CONTENT|
| ------------- |-------------:|
| Page      |  |
|  | Functional Categories |
|  | Records Retention Schedules |
| Functional Category      |  |
|  | Administrative Records |
|  | Alumni and Development Records |
|  | Archives, Libraries, and Museums Records |
|  | Athletics Records |
|  | Audio/Visual Records |
|  | Curriculum and Instruction Records |
|  | Equipment and Supplies Records |
|  | Facilities and Property Records |
|  | Financial and Accounting Records |
|  | Grants and Research Records |
|  | Health Services and Medical Records |
|  | Human Resources and Personnel Records |
|  | Information Technology Records |
|  | Legal Records |
|  | Publications, Marketing and Communication Records |
|  | Student Records: Academic |
|  | Student Records: Financial Services |
|  | Student Records: Residential Life |
|  | Campus Services and Auxiliary Operations Records |
|  | Risk Management and Safety Records |
|  | Security, Police and Fire Records |
|  | Records Retention Schedules |
| Record Type |  |

If you're importing additional record types, it's assumed the above content is already in place.  Just provide a csv file with record types will be imported.

## Pre-requisites
 * pip install contentful_management
 * npm install contentful-import
 * modify and save the import_archives.py script with your filename and contentful token

## Backup and Import
Remove all content mentioned above in the archive space or create a new space before restoring from backup.
 1. contentful-import --space-id '<space id>' --environment-id '<env id>' --content-file 'contentful-export-6vuuqxb2pkxd-master-2018-10-10T10-21-01'
 2. python import_archives.py

## Import only
 2. python import_archives.py
