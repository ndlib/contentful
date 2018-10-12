#!/usr/bin/python

import csv
import sys
from contentful_management import Client

# contentful management token
management_token = 'CONFIGURE_ME'

# FULL path to file to import
filename = 'CONFIGURE_ME' #/Users/me/the/path/to/file.csv

# archive space id
contentful_space = '6vuuqxb2pkxd'

def runimport():
    client = Client(management_token)

    with open(filename, 'rb') as f:
        reader = csv.reader(f)
        try:
            for row in reader:
                # skip header row
                if row[0] == '':
                    continue

                category = getFunctionalCategory(row[1])
                if category == "Invalid category":
                    print "Invalid category - '" + row[1] + "'. Will not import row " + row[0]
                    continue

                gc_date = None
                if row[20] != '':
                    gc_date = formatDate(row[20])
                
                revised_date = None
                if row[21] != '':
                    revised_date = formatDate(row[21])
                
                entry = {
                    "content_type_id": "recordType",
                    "fields": {
                        "recordType": {
                        "en-US": row[2]
                        },
                        "category": {
                        "en-US": {
                            "sys": {
                            "type": "Link",
                            "linkType": "Entry",
                            "id": category
                            }
                        }
                        },
                        "scheduleId": {
                        "en-US": row[3]
                        },
                        "recordTypeDescription": {
                        "en-US": row[4]
                        },
                        "officialCopy": {
                        "en-US": row[5]
                        },
                        "retention": {
                        "en-US": row[6]
                        },
                        "triggerEvent": {
                        "en-US": row[7]
                        },
                        "disposition": {
                        "en-US": row[8]
                        },
                        "dispositionMethod": {
                        "en-US": row[9]
                        },
                        "referenceCopy": {
                        "en-US": row[10]
                        },
                        "referenceCopyDisposition": {
                        "en-US": row[11]
                        },
                        "referenceCopyDispositionMethod": {
                        "en-US": row[12]
                        },
                        "dataClassification": {
                        "en-US": row[13]
                        },
                        "storageRequirements": {
                        "en-US": row[14]
                        },
                        "legalReference": {
                        "en-US": row[15]
                        },
                        "notes": {
                        "en-US": row[16]
                        },
                        "systemOfRecord": {
                        "en-US": row[17]
                        },
                        "generalCounselNotes": {
                        "en-US": row[18]
                        },
                        "dateApprovedByGeneralCounsel": {
                        "en-US": gc_date
                        },
                        "dateRevised": {
                        "en-US": revised_date
                        }
                    }
                }
                #print entry
                client.entries(contentful_space, 'master').create(None, entry)
        except csv.Error as e:
            sys.exit('file %s, line %d: %s' % (filename, reader.line_num, e))

#
# formats one date string format to another
# input - string formatted mm/dd/yyyy
# output - string formatted yyyy-mm-dd
#
def formatDate (mydate):
    mds = mydate.split("/")
    if len(mds[0]) == 1:
        month = "0" + mds[0]
    else:
        month = mds[0]
    if len(mds[1]) == 1:
        day = "0" + mds[1]
    else:
        day = mds[1]
    year = "20" + mds[2]
    return year + "-" + month + "-" + day

# mapper to category and its corresponding archives contentful id
def getFunctionalCategory (category):
    switcher = {
        "Administrative Records": "1MtY5EsFLyia4gKm4EcWgs",
        "Alumni and Development Records": "1Hg74grEpCWQeMsC0G0mY4",
        "Archives, Libraries, and Museums Records": "2LFO5dAkJq6q0eWGOa4Y0E",
        "Athletics Records": "4Alt5MEDrW42KsKiEWIggo",
        "Audio/Visual Records": "6nxijuigj6ImcYY2MYicSQ",
        "Curriculum and Instruction Records": "7ephhWwTFS4C8MuSIEqGek",
        "Equipment and Supplies Records": "6GkbAgrPA4uO0mg06KyMCG",
        "Facilities and Property Records": "4zqSm0QwIo6Q0WSqiUI84Q",
        "Financial and Accounting Records": "5lVHGI5KoMky8CmcmM6oaM",
        "Grants and Research Records": "5yGgVaYK2suOeC06cS4KCW",
        "Health Services and Medical Records": "2hOdPtXiCcYeOGi2Kk8esa",
        "Human Resources and Personnel Records": "tWRYfp1EacyYeOIeG4ouG",
        "Information Technology Records":"3MzfhlgbnysSM882C8eIQu",
        "Legal Records":"6phZ4ROGXe0CuGSsGE0SaO",
        "Publications, Marketing and Communication Records":"16KpRSqZUGYwgyAgW22wSg",
        "Student Records: Academic":"6dPLSupJmgqGe8E0SUeI0a",
        "Student Records: Financial Services":"5Wf6xkPxM4qS8mEOgeuke8",
        "Student Records: Residential Life":"69lftMLnQQkY4GiukiCU2w",
        "Campus Services and Auxiliary Operations Records":"61PhZsJ1cWQmkESmi8KkGe",
        "Risk Management and Safety Records":"1w88ZgAa00ei2Aw06uA862",
        "Security, Police and Fire Records":"15CwXKzUPw4OS4qsAWEygw",
        "Records Retention Schedules":"5smwBS7j8Iu8gc60OMkgSm",
    }
    return switcher.get(category, "Invalid category")


if management_token == 'CONFIGURE_ME':
    print "Please set 'management_token' with a valid token and run again!"
    exit()
if filename == 'CONFIGURE_ME':
    print "Please set 'filename' correctly and run again!"
    exit()

# do it
runimport()