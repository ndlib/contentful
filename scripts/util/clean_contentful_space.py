import sys
from contentful_management import Client

# FYI, this is pretty slow if you have a ton of content in the space. I assume this is due to the API rate limits, and
# the client manages its deletion rate accordingly. Be prepared to leave this on in the background for a while.
def run():
  if len(sys.argv) < 4:
    helpText()
    sys.exit()

  contentful_space = sys.argv[1]
  contentful_environment = sys.argv[2]
  management_token = sys.argv[3]

  client = Client(management_token)
  space = client.spaces().find(contentful_space)

  question = "WARNING: This will delete ALL content in the '" + space.name + "' space under the '" + contentful_environment + "' environment. Are you sure you wish to continue?"
  if not confirmContinue(question):
    sys.exit()

  # API only fetches 100 entries at a time, so keep looping until we don't find any more.
  # This could cause an infinite loop if any entries fail to delete, but hey, this is just a convenience utility anyway.
  while True:
    try:
      print('Checking for entries...')
      entries = client.entries(contentful_space, contentful_environment).all()
      print('Found ' + str(len(entries)) + ' entries.')
      if len(entries) == 0:
        break

      for entry in entries:
        displayName = entry.title if hasattr(entry, 'title') else entry.name if hasattr(entry, 'name') else entry.sys['id']
        if entry.is_published:
          print("Unpublishing " + displayName + "...")
          entry.unpublish()
        print("Deleting " + displayName + "...")
        entry.delete()
    except KeyboardInterrupt:
      print "\nInterrupted by user. Exiting."
      sys.exit()

  print("Complete.")

def helpText():
  print('Usage: ' + sys.argv[0] + ' [contentful_space_id] [environment] [management_token]')

def confirmContinue(q):
  valid = {"yes": True, "y": True, "ye": True,
           "no": False, "n": False}

  while True:
      sys.stdout.write(q + " [y/n]")

      try:
        choice = raw_input().lower()
      except KeyboardInterrupt:
        print "\nInterrupted by user. Exiting."
        sys.exit()

      if choice == '' or choice == None:
          return valid['n']
      elif choice in valid:
          return valid[choice]
      else:
          sys.stdout.write("Please respond with 'y' for yes or 'n' for no.\n")

run()