const core = require('@actions/core');
const github = require('@actions/github');
const child_process = require('child_process');
const util = require('util');


async function main() {

  try {
    //define git log script for easy debuggin, this will return data as json file
    const format = ' --pretty=format:\'{%n  "commit": "%H",%n  "author": "%aN",%n  "date": "%ad",%n  "message": "%f"%n},\'';
    const endPart =  "$@ | perl -pe 'BEGIN{print \"[\"}; END{print \"]\n\"}' | perl -pe 's/},]/}]/'";
    
    //get latest tag
    const latestRelease = await exec('git describe --tags --abbrev=0');
    const logScript = "git log " + latestRelease + "..HEAD " + format + endPart;  
    const logs = await exec(logScript)
    const parsedLogs = await parseLogsJson(logs);
    const changeLogs = await generatedChangeLogs(parsedLogs);


    //log this for debugging purposes
    console.log(`latest tag: ${latestRelease}`);
    console.log(`The logs: ${logs}`);
    console.log(`The changeLogs: ${changeLogs}`);

    core.setOutput('latest_tag', latestRelease);
    core.setOutput('logs-on-json', logs);
    core.setOutput('change-logs', changeLogs);
  } catch (error) {
    core.setFailed(error.message);
  }  
}

async function exec(command) {
      const { stdout, stderr } = await util.promisify(child_process.exec)(command)
      if (stderr) console.error(stderr)
      return stdout.trim();
}

async function parseLogsJson(logs){
  var feature = new Array();
  var bug = new Array();

  var parsedJSON = JSON.parse(logs);
  for( let num in parsedJSON ){
    var log = parsedJSON[num];
    var message = log.message;
    
    var splitMessage = message.split("-");
    if(splitMessage[0] == "t"){
      var type = splitMessage[0];
      var id = splitMessage[1];
      
      splitMessage.shift();
      splitMessage.shift();
      var message = splitMessage.join(" ");
      feature.push(new Array(type, id, message, log.author));
    }
    
    if(splitMessage[0] == "b"){
      var type = splitMessage[0];
      var id = splitMessage[1];
      
      splitMessage.shift();
      splitMessage.shift();
      var message = splitMessage.join(" ");
      bug.push(new Array(type, id, message, log.author));
    }
    
  }
  return new Array(feature, bug);
}

async function generatedChangeLogs(data){
  let feature = data[0];
  let bugs = data[1];

  var changeLogMessage = "## What’s New";

  if(feature.length > 0){
    changeLogMessage += "\n\n### Features";

    for (let i = 0; i < feature.length; i++) {

      changeLogMessage += "\n* " + feature[i][3] + feature[i][4]
    }
  }


  if(bugs.length > 0){
    changeLogMessage += "\n";
    changeLogMessage += "\n ### BugFixes";

    for (let i = 0; i < bugs.length; i++) {

      changeLogMessage += "\n * " + bugs[i][3] + bugs[i][4]
    }
  }

  return changeLogMessage;
}

main();


