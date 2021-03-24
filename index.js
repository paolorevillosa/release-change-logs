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
    console.log(`latest tag: ${latestRelease}`);
    core.setOutput('latest_tag', latestRelease);


    const logScript = "git log " + latestRelease + "..HEAD " + format + endPart;  
    const logs = await exec(logScript)

    console.log(`The logs: ${logs}`);
    core.setOutput('logs-on-json', logs);
  } catch (error) {
    core.setFailed(error.message);
  }  
}

async function exec(command) {
      const { stdout, stderr } = await util.promisify(child_process.exec)(command)
      if (stderr) console.error(stderr)
      return stdout.trim();
}

async function generateChangeLogs(logs){
  var feature = new Array();
  var bugs = new Array(); 

  var parsedJSON = JSON.parse(logs);
  for( let log in parsedJSON ){
    console.lo;

  }

}

main();


