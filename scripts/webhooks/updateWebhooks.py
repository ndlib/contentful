from scriptBase import ScriptBase
from datetime import datetime
import json

class Runner(ScriptBase):
  def __init__(self):
    super(Runner, self).__init__("Update Webhooks")


  def run(self, args):
    _token = "Bearer %s" % self.getEnv("OAUTH")
    _baseSpaceUrl = "https://api.contentful.com/spaces/%s/webhook_definitions" % self.getEnv("SPACE")

    response = self._makeRequest(_baseSpaceUrl, headers={ "Authorization": _token })
    response = json.loads(response)

    if response.get("sys", {}).get("type") == "Error":
      self.abort(response.get("message"))

    items = response.get("items")

    prefixes = [
      "Publish to Usurper Alpha",
      "Publish to Usurper Beta",
      "Libguides Event Updater"
    ]

    toChange = {}

    for item in items:
      name = item.get("name")

      for prefix in prefixes:
        if prefix + " (r" in name:
          versionStart = name.find("(r") + 1
          version = name[versionStart:-1]
          dateStr = version[1:9]

          date = datetime.strptime(dateStr, "%Y%m%d")

          if date <= toChange.get(prefix, {}).get("date", date):
            toChange[prefix] = {
              "date": date,
              "version": version,
              "item": item,
            }

    for _, data in toChange.iteritems():
      item = data.get("item")
      self.info("Will update \"%s\" to %s" % (item.get("name"), args.revision))

    if args.dryrun:
      self.quit("Stopping because 'dryrun' was specified")

    if not self.userConfirm("Update Production Webhooks?"):
      self.quit()

    for _, data in toChange.iteritems():
      item = data.get("item")
      itemId = item.get("sys", {}).get("id")
      itemVerison = item.get("sys", {}).get("version")

      self.info("Updating \"%s\" to %s" % (item.get("name"), args.revision))

      del item["sys"]
      item["name"] = item.get("name").replace(data.get("version"), args.revision)
      item["url"] = item.get("url").replace(data.get("version"), args.revision)

      url = "%s/%s" % (_baseSpaceUrl, itemId)
      headers = {
        "Authorization": _token,
        "Content-Type": "application/vnd.contentful.management.v1+json",
        "X-Contentful-Version": itemVerison,
      }
      ret = self._makeRequest(url, headers=headers, method='PUT', data=json.dumps(item))
      print ret


if __name__ == "__main__":
  r = Runner()

  r.parser.add_argument('-r', '--revision', required=True, type=str,
    help="The release revision (eg. r20180105)")

  r.requireEnv('OAUTH', 'Contentful OAUTH Token')
  r.requireEnv('SPACE', 'Contentful Space')

  r.main()
