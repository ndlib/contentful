import urllib, urllib2
import argparse
import sys

from hesburgh import scriptutil, hesutil

class GracefulQuitException(Exception):
  def __init__(self, exitCode, message = ""):
    super(GracefulQuitException, self).__init__(message)
    self.exitCode = exitCode


class ScriptBase(object):
  def __init__(self, scriptName):
    super(ScriptBase, self).__init__()
    self.scriptName = scriptName
    self.parser = argparse.ArgumentParser()
    self._debug = False
    self._verbose = False
    self._argVars = None

    self._envRequirements = []


  def requireEnv(self, envName, envDesc):
    flag = "--%s" % envName.lower()
    self.parser.add_argument(flag, type=str, help=envDesc)
    self._envRequirements.append(envName)


  def getEnv(self, envName):
    flag = envName.lower()
    if self._argVars.get(flag):
      return self._argVars.get(flag)
    return hesutil.getEnv(envName)


  def _makeRequest(self, url, headers={}, method='GET', data=None):
    req = urllib2.Request(url, headers=headers, data=data)
    req.get_method = lambda: method
    response = None
    try:
      response = urllib2.urlopen(req)
    except urllib2.HTTPError as e:
      self.error("Request Error: %s %s" % (e.code, url))
      # self.error(e.read())
      return e.read()
    except urllib2.URLError as e:
      self.error(e.reason)

    return response.read() if response else None


  def getInput(self, query):
    return raw_input("\n%s\n>> " % query)


  def userConfirm(self, query):
    invalid = False
    while True:
      if invalid:
        print scriptutil.format("Please input [y|n]", scriptutil.FG_YELLOW)

      response = self.getInput(query)
      if ' ' in response or len(response) <= 0:
        invalid = True
        continue

      response = response.lower()
      if response == "y" or response == "yes":
        return True
      if response == "n" or response == "no":
        return False
      invalid = True


  def status(self, status):
    print "::: %s :::" % status


  def debug(self, message):
    if self._debug:
      print scriptutil.format(":: DEBUG :: %s" % message, scriptutil.FG_DARK_GRAY)


  def verbose(self, message):
    if self._verbose:
      self.info(message)


  def info(self, message):
    print message


  def warn(self, message):
    print scriptutil.format(":: WARN :: %s" % message, scriptutil.FG_YELLOW)


  def error(self, message):
    print scriptutil.error(":: ERROR :: %s " % message)


  def quit(self, message = None):
    if message:
      self.info(message)
    raise GracefulQuitException(0)


  def abort(self, message):
    self.error(message)
    raise GracefulQuitException(1)


  def checkEnv(self):
    for e in self._envRequirements:
      if not self.getEnv(e):
        self.abort("Variable '%s' not found in Environment or supplied arguments" % e)


  def main(self):
    try:
      self.status(scriptutil.success(self.scriptName))
      self.parser.add_argument('--debug', action='store_true',
        help="Turn on Debug logging")
      self.parser.add_argument('--verbose', action='store_true',
        help="Turn on Verbose logging")
      self.parser.add_argument('--dryrun', action='store_true',
        help="Run without making updates")

      args = self.parser.parse_args()

      if args.debug or args.verbose:
        self._debug = True
      if args.verbose:
        self._debug = True
        self._verbose = True

      self._argVars = vars(args)
      self.checkEnv()

      self.run(args)

    except GracefulQuitException as e:
      sys.exit(e.exitCode)

    except Exception as e:
      self.error(e)
      sys.exit(1)
