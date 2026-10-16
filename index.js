const core = require('@actions/core');
const github = require('@actions/github');
const child_process = require('child_process');
const util = require('util');
const fs = require('fs');

//non-printable separators so commit fields can contain any character (quotes, backslashes, commas, etc)
const FIELD_SEPARATOR = '\x1f';
const RECORD_SEPARATOR = '\x1e';

let tags = {"feature":'Feature', "bugfixes":'Bugfixes'}; //default commit tags
var chageLogTags = new Array();
var changeLogMessage = "## What’s New\n";
var customCommitHash = "";

async function main() {
  try {
    console.log(tags);
    setupInput();
    console.log(tags);

    //setup commit prefix tags
    for (let key in tags){
      //set data to lower case to avoid issue regarding data
      chageLogTags[key.toLowerCase()] = new Array();
      tags[key.toLowerCase()] = tags[key];
    };
    console.log(chageLogTags);

    //get latest tag
    var latestRelease = customCommitHash;
    if(latestRelease == ''){
      latestRelease = await exec('git', ['describe', '--tags', '--abbrev=0']);
    }

    //fields are separated by control characters and converted to json here,
    //so special characters on commit messages/authors will not break the json
    const format = '--pretty=format:' + ['%h', '%aN', '%ad', '%f', '%s'].join('%x1f') + '%x1e';
    const rawLogs = await exec('git', ['log', latestRelease + '..HEAD', format]);
    const parsedLogs = parseGitLog(rawLogs);
    const logs = JSON.stringify(parsedLogs);

    await parseData(parsedLogs);
    fs.writeFileSync('logs.txt', logs);


    //log this for debugging purposes
    console.log(`latest tag: ${latestRelease}`);
    console.log(`The logs: ${logs}`);
    console.log(`The changeLogs: ${changeLogMessage}`);

    core.setOutput('latest_tag', latestRelease);
    core.setOutput('logs-on-json', logs);
    core.setOutput('change-logs', changeLogMessage);
    core.setOutput('logs-on-text-file', "logs.txt");
  } catch (error) {
    core.setFailed(error.message);
  }  
}

async function exec(command, args) {
      //execFile does not use a shell, so inputs with special characters are passed as is
      const { stdout, stderr } = await util.promisify(child_process.execFile)(command, args, { maxBuffer: 50 * 1024 * 1024 })
      if (stderr) console.error(stderr)
      return stdout.trim();
}

/**
 * Convert raw git log output into array of commit objects
 *
 * @param String rawLogs
 */
function parseGitLog(rawLogs){
  return rawLogs.split(RECORD_SEPARATOR)
    .map(record => record.replace(/^\s+/, ''))
    .filter(record => record !== '')
    .map(record => {
      const [commit, author, date, message, original_message] = record.split(FIELD_SEPARATOR);
      return { commit, author, date, message, original_message };
    });
}

function setupInput(){
  if (!!core.getInput('custom_tags')) {
    try {
      tags = JSON.parse(core.getInput('custom_tags'));
    } catch (error) {
      throw new Error('custom_tags must be a valid JSON string: ' + error.message);
    }
  }

  if (!!core.getInput('commit_hash')) {
    customCommitHash = core.getInput('commit_hash').trim();
  }
}


/**
 * Will parse json based on tags provided
 * and will generate change logs
 *
 * @param Array parsedJSON
 */
async function parseData(parsedJSON){
  var myArray = [];
  for( let num in parsedJSON ){
    var log = parsedJSON[num];
    var message = log.message || '';
    
    var splitMessage = message.split("-");
    var type = splitMessage[0];
    var id = splitMessage[1];

    if(chageLogTags[type.toLowerCase()] !== undefined){
      if(myArray.includes(id)){
        continue;
      }
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


