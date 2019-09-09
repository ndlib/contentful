import csv
import json
import os
import sys
from collections import OrderedDict

def convert(inputFilename, outputFilename):
  fields = OrderedDict([
    ('title', 'string'),
    ('key', 'string'),
    ('useProxy', 'bool'),
    ('destination', 'string'),
    ('status', 'string'),
    ('catalogId', 'int'),
    ('sourceId', 'string'),
  ])
  out_entries = []

  with open(inputFilename, 'r') as source:
    reader = json.load(source)
    for entry in reader['entries']:
      out = OrderedDict()
      for fieldId in fields:
        out[fieldId] = OrderedDict()
        if fields[fieldId] == 'bool':
          out[fieldId] = 1 if str(entry['fields'][fieldId]['en-US']) == 'true' else 0
        else:
          out[fieldId] = entry['fields'][fieldId]['en-US']
      out_entries.append(out)

  with open(outputFilename, 'w') as dest:
    writer = csv.writer(dest, delimiter=',', quotechar='"', quoting=csv.QUOTE_NONNUMERIC)

    writer.writerow(fields.keys())
    for row in out_entries:
      writer.writerow(dict(row).values())

def run():
  if len(sys.argv) < 2:
    helpText()
    return

  inFilename = sys.argv[1]

  outputFilename = os.path.splitext(inFilename)[0] + '.csv'
  print('Converting Contentful format to CSV...')
  convert(inFilename, outputFilename)
  print('Conversion completed. Output to: ' + outputFilename)

def helpText():
  print('Usage: ' + sys.argv[0] + ' [input_filename]')

run()