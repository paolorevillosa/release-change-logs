const core = require('@actions/core');
const file_command_1 = require("@actions/lib/file-command");
const github = require('@actions/github');
const child_process = require('child_process');
const util = require('util');
const os = require("os")
const fs = require("fs")

let tags = {"feature":'Feature', "bugfixes":'Bugfixes'}; //default commit tags
var chageLogTags = new Array();
var changeLogMessage = "## What’s New\n";

const OUTPUTS = {
  LATEST_TAG: 'LATEST_TAG',
  dockerUsername: 'docker_username',
  dockerPassword: 'docker_password'
};

async function main() {
  console.log(tags);
  setupInput();
  console.log(tags);

  try {
    //setup commit prefix tags
    for (let key in tags){
      //set data to lower case to avoid issue regarding data
      chageLogTags[key.toLowerCase()] = new Array();
      tags[key.toLowerCase()] = tags[key];
    };
    console.log(chageLogTags);

    //define git log script for easy debuggin, this will return data as json file
    const format = ' --pretty=format:\'{"commit": "%h","author": "%aN","date": "%ad","message": "%f", "original_message": "%s"},\'';
    const endPart =  "$@ | perl -pe 'BEGIN{print \"[\"}; END{print \"]\"}' | perl -pe 's/},]/}]/'";
    
    //get latest tag
    const latestRelease = await exec('git describe --tags --abbrev=0'); 
    const logScript = "git log " + latestRelease + "..HEAD " + format + endPart;
    const logs = await exec(logScript)
    
    await parseData(logs);
    await exec(logScript + " > logs.txt");


    //log this for debugging purposes
    console.log(`latest tag: ${latestRelease}`);
    console.log(`The logs: ${logs}`);
    console.log(`The changeLogs: ${changeLogMessage}`);

    setOutput3(OUTPUTS.LATEST_TAG, latestRelease);
    // setOutput3('logs-on-json', logs);
    setOutput3('change-logs', changeLogMessage);
    setOutput3('logs-on-text-file', "logs.txt");
  } catch (error) {
    core.setFailed(error.message);
  }  
}

async function exec(command) {
      const { stdout, stderr } = await util.promisify(child_process.exec)(command)
      if (stderr) console.error(stderr)
      return stdout.trim();
}

function setupInput(){
  if (!!core.getInput('custom_tags')) {
    tags = JSON.parse(core.getInput('custom_tags'));
  }
}



function setOutput2(key, value) {
  // Temporary hack until core actions library catches up with github new recommendations
  const output = process.env['GITHUB_OUTPUT']
  fs.appendFileSync(output, `${key}=${value}${os.EOL}`)
}

function setOutput3(name, value) {
  const filePath = process.env['GITHUB_OUTPUT'] || '';
  if (filePath) {
      return file_command_1.issueFileCommand('OUTPUT', file_command_1.prepareKeyValueMessage(name, value));
  }
  process.stdout.write(os.EOL);
  command_1.issueCommand('set-output', { name }, utils_1.toCommandValue(value));
}


/**
 * Will parse json based on tags provided
 * and will generate change logs
 *
 * @param String logs
 */
async function parseData(logs){
  var parsedJSON = JSON.parse(logs);
  for( let num in parsedJSON ){
    var log = parsedJSON[num];
    var message = log.message;
    
    var splitMessage = message.split("-");
    var type = splitMessage[0];
    var id = splitMessage[1];

    if(chageLogTags[type.toLowerCase()] !== undefined){
      chageLogTags[type.toLowerCase()].push(new Array(type, id, message, log.author, log.original_message, log.commit ));  
    }
  }

  for (let key in chageLogTags){

      var data = chageLogTags[key];
      for (let i = 0; i < data.length; i++) {
        if(i ==0){
            changeLogMessage += "\n\n ### " + tags[key];
        }

        changeLogMessage += "\n* " + data[i][4] + " (@" + data[i][3] + ") " + data[i][5];
      }
  };
}

main();


