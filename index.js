const core = require('@actions/core');
const github = require('@actions/github');
const child_process = require('child_process');
const util = require('util');


let featureTag = "FEATURE";
let bugTag = "BUGFIX";
let tags = ["Feature","Bugfixes"];

async function main() {

  try {
    setupInput();


    //define git log script for easy debuggin, this will return data as json file
    const format = ' --pretty=format:\'{"commit": "%H","author": "%aN","date": "%ad","message": "%f"},\'';
    const endPart =  "$@ | perl -pe 'BEGIN{print \"[\"}; END{print \"]\"}' | perl -pe 's/},]/}]/'";
    
    //get latest tag
    const latestRelease = await exec('git describe --tags --abbrev=0'); 
    console.log(`latest tag: ${latestRelease}`);

    const logScript = "git log " + latestRelease + "..HEAD " + format + endPart;
    const logs = await exec(logScript)
    console.log(`The logs: ${logs}`);

    const parsedLogs = await parseLogsJson(logs);
    const changeLogs = await generatedChangeLogs(parsedLogs);
    console.log(`The changeLogs: ${changeLogs}`);

    await exec(logScript + " > logs.txt");

    core.setOutput('latest_tag', latestRelease);
    core.setOutput('logs-on-json', logs);
    core.setOutput('change-logs', changeLogs);
    core.setOutput('logs-on-text-file', "logs.txt");
  } catch (error) {
    core.setFailed(error.message);
  }  
}


function setupInput(){
  if (!!core.getInput('feature')) {
    featureTag = core.getInput('feature')
  }

  if (!!core.getInput('bugs')) {
    bugTag = core.getInput('bugs')
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
    if(splitMessage[0].toLowerCase() == featureTag.toLowerCase()){
      var type = splitMessage[0];
      var id = splitMessage[1];
      
      splitMessage.shift();
      splitMessage.shift();
      var message = splitMessage.join(" ");
      feature.push(new Array(type, id, message, log.author));
    }
    
    if(splitMessage[0].toLowerCase() == bugTag.toLowerCase()){
      var type = splitMessage[0];
      var id = splitMessage[1];
      
      splitMessage.shift();
      splitMessage.shift();
      var message = splitMessage.join(" ");
      bug.push(new Array(type, id, message, log.author));
    }

    if(bugTag.toLowerCase() == "b" && splitMessage[0].toLowerCase() == "cb"){
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


async function parseLogsJsonMultiTagsVersion(logs){
  var tags = new Array();

  for (let i = 0; i < tags.length; i++) {
    tags[tags[i]] = new Array();
  }

  var parsedJSON = JSON.parse(logs);
  for( let num in parsedJSON ){
    var log = parsedJSON[num];
    var message = log.message;
    
    var splitMessage = message.split("-");
    if(splitMessage[0].toLowerCase() == featureTag.toLowerCase()){
      var type = splitMessage[0];
      var id = splitMessage[1];
      
      splitMessage.shift();
      splitMessage.shift();
      var message = splitMessage.join(" ");
      feature.push(new Array(type, id, message, log.author));
    }

  }
}

async function generatedChangeLogs(data){
  let feature = data[0];
  let bugs = data[1];

  var changeLogMessage = "## What’s New";

  if(feature.length > 0){
    changeLogMessage += "\n\n### Features";

    for (let i = 0; i < feature.length; i++) {

      changeLogMessage += "\n* " + feature[i][2] + " @" + feature[i][3]
    }
  }


  if(bugs.length > 0){
    changeLogMessage += "\n";
    changeLogMessage += "\n ### BugFixes";

    for (let i = 0; i < bugs.length; i++) {

      changeLogMessage += "\n * " + bugs[i][2] + " @" + bugs[i][3]
    }
  }

  return changeLogMessage;
}

main();


