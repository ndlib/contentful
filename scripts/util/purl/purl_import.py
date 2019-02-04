import json
import sys
import os
from collections import OrderedDict
from contentful_management import Client

def convert(inputFilename, outputFilename):
  fields = OrderedDict([
    ('title', 'string'),
    ('key', 'string'),
    ('useProxy', 'bool'),
    ('destination', 'string'),
    ('status', 'string'),
    ('context', 'string'),
    ('catalogId', 'int'),
    ('sourceId', 'string'),
  ])
  entries = []

  with open(inputFilename, 'r') as source:
    reader = json.load(source)
    for cells in reader['data']:
      entry = OrderedDict()
      entry['sys'] = {
        "type": "Entry",
        "contentType": {
          "sys": {
            "type": "Link",
            "linkType": "ContentType",
            "id": "purl"
          }
        }
      }
      entry['fields'] = OrderedDict()
      for fieldId in fields:
        entry['fields'][fieldId] = OrderedDict()
        if fields[fieldId] == 'bool':
          entry['fields'][fieldId]['en-US'] = (cells[fieldId] != 0 and str(cells[fieldId]).lower() != 'false')
        elif fields[fieldId] == 'int':
          entry['fields'][fieldId]['en-US'] = None if str(cells[fieldId]).strip() == '' else int(cells[fieldId])
        else:
          entry['fields'][fieldId]['en-US'] = str(cells[fieldId]) if isinstance(cells[fieldId], int) else cells[fieldId]
      entries.append(entry)

  output = {
    "entries": entries,
  }

  with open(outputFilename, 'w') as dest:
    json.dump(output, dest, indent=2)
    dest.write('\n')

def importDataV2(filename, space, environment, token):
  client = Client(token)
  with open(filename, 'r') as source:
    errors = list()
    reader = json.load(source)
    count = 0
    for entry in reader['entries']:
      displayName = entry['fields']['title']['en-US']
      if not 'content_type_id' in entry:
        entry['content_type_id'] = entry['sys']['contentType']['sys']['id']

      print("Importing " + displayName + '...')
      try:
        new_entry = client.entries(space, environment).create(None, entry)
        new_entry.publish()
        count = count + 1
      except Exception:
        print("\tFailed. Moving on.")
        errors.append(displayName)

    print("Import complete. Successfully imported " + str(count) + "/" + str(count + len(errors)) + " items.")
    if len(errors) > 0:
      print("\nThe following items failed to create/publish:")
      for err in errors:
        print("\t" + err)

# I started with this, but it didn't want to publish records for some reason. Leaving it here in case it is useful later
def importDataCli(filename, space, environment, token):
  command = 'contentful space import'
  command += ' --space-id ' + space
  command += ' --environment-id ' + environment
  command += ' --content-file ' + filename
  command += ' --management-Token ' + token
  print('Initiating import...')
  os.system(command)

def run():
  if len(sys.argv) < 5:
    helpText()
    return

  inFilename = sys.argv[1]
  contentful_space = sys.argv[2]
  environment = sys.argv[3]
  management_token = sys.argv[4]

  outputFilename = 'purl_contentful_data.json'
  print('Converting to Contentful format...')
  convert(inFilename, outputFilename)
  print('Conversion completed. Output to: ' + outputFilename)

  try:
    print('\nPress enter to continue with import.')
    raw_input()
    importDataV2(outputFilename, contentful_space, environment, management_token)
  except KeyboardInterrupt:
    print "\nInterrupted by user. Exiting."
    sys.exit()

def helpText():
  print('Usage: ' + sys.argv[0] + ' [input_filename] [contentful_space_id] [environment] [management_token]')

run()