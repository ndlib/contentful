import sys
from contentful import Client

def run():
  if len(sys.argv) < 3:
    helpText()
    sys.exit()

  contentful_space = 'cfblb1f7i85j'
  contentful_environment = sys.argv[1]
  management_token = sys.argv[2] # You can use the ContentfulDirect CDN API key for the appropriate environment

  outputCode = None
  if len(sys.argv) > 4 and (sys.argv[3] == '--output-results' or sys.argv[3] == '-o'):
    outputCode = sys.argv[4]

  client = Client(contentful_space, management_token, environment=contentful_environment)

  # API only fetches 100 entries at a time, so keep looping until we don't find any more.
  results = {}
  max = 999999
  searched = 0
  overlaps = 0

  while True:
    try:
      print('Checking for entries...')
      entries = client.entries({'content_type': 'collectionCallRanges', 'skip': searched})
      max = entries.total
      print('Found ' + str(len(entries.items)) + ' entries.')
      if len(entries.items) == 0:
        break

      for entry in entries.items:
        # If we haven't found any other items with the same sublibrary and collection code, we can skip ahead
        if (entry.collection_sublibrary in results):
          # Search for records we have already found that have overlapping call numbers
          for compare in results[entry.collection_sublibrary]:
            entStart = entry.range_start or '00 000000'
            entEnd = entry.range_end or 'ZZ 999999'
            compStart = compare['start'] or '00 000000'
            compEnd = compare['end'] or 'ZZ 999999'

            if (entStart >= compStart and entStart <= compEnd) or \
            (entEnd >= compStart and entEnd <= compEnd) or \
            (entStart <= compStart and entEnd >= compEnd):
              overlaps += 1
              print('!!! Overlap found !!!\tItems: ' + entry.id + ' AND '+ compare['id'])
              print('\t' + entry.collection_sublibrary + '\t\t' + entry.range_start + '-' + entry.range_end + '\t:\t' + compare['start'] + '-' + compare['end'] )
        else:
          results[entry.collection_sublibrary] = []

        # Add every entry to results so we can compare future entries with it
        results[entry.collection_sublibrary].append({ 'id': entry.id, 'start': entry.range_start, 'end': entry.range_end})

      # Add to count so we can fetch the next page, if there are any items left to fetch
      searched += len(entries.items)
      if searched >= max:
        break
    except KeyboardInterrupt:
      print "\nInterrupted by user. Exiting."
      sys.exit()

  print("Complete. " + str(overlaps) + " overlap" + ("s" if overlaps != 1 else "") + " found.")

  if outputCode != None:
    outputRecords(results, outputCode)

def helpText():
  print('Usage: ' + sys.argv[0] + ' [environment] [management_token]')

def outputRecords(records, code):
  print('\nPrinting all records for ' + code + '...')
  sortedRecords = sorted(records[code], key=lambda dct: dct['start'])
  for record in sortedRecords:
    print('\tID: ' + record['id'])
    print('\t\tRange Start:\t' + record['start'])
    print('\t\tRange End:\t' + record['end'])

run()