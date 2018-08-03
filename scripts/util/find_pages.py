import json
import re

#reads in an export of a contentful space and then
#parses through entries and assets searching for data

with open('content-export.json') as f:
    data = json.load(f)

locale = "en-US"

elist = []
alist = []

for entry in data["entries"]:

  url = "https://app.contentful.com/spaces/cfblb1f7i85j/entries/"

  if 'type' in entry['fields']:
    if 'Page' in entry["fields"]["type"][locale]:
      epage = entry["fields"]["type"]["en-US"]
      url += entry["sys"]["id"]
      elist.append(url)

print ("\n".join(elist))
