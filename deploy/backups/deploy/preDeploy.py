from hesburgh import scriptutil, heslog

def run(stage):
  heslog.info("Retrieving node modules")
  scriptutil.executeCommand("cd ../backup && yarn install")
  return { "env": "" }