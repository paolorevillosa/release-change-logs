const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');

const child_process = require('child_process');
const util = require('util');


async function main() {

  try {
    // `who-to-greet` input defined in action metadata file
    const nameToGreet = core.getInput('who-to-greet');
    console.log(`Hello ${nameToGreet}!`);
    const time = (new Date()).toTimeString();
    core.setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2);


    
    

    const latestRelease = await exec2('git describe --tags --abbrev=0');
    console.log(`latest tag: ${latestRelease}`);
    const logScript = `git log ${latestRelease}..HEAD --pretty=format:'{%n  "commit": "%H",%n  "author": "%aN <%aE>",%n  "date": "%ad",%n  "message": "%f"%n},'     $@ |     perl -pe 'BEGIN{print "["}; END{print "]\n"}' |     perl -pe 's/},]/}]/'`;



    console.log(`logScript: ${logScript}`);
    const logs = exec.exec(logScript)
    console.log(`The logs: ${logs}`);
  } catch (error) {
    core.setFailed(error.message);
  }  
}

async function exec2(command) {
      const { stdout, stderr } = await util.promisify(child_process.exec)(command)
      if (stderr) console.error(stderr)
      return stdout.trim();
}

main();


