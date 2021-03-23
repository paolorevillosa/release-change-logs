const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');

try {
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Hello ${nameToGreet}!`);
  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  

  const latestRelease = exec.exec('git describe --tags --abbrev=0');
  
  const logScript = 'git log '+ latestRelease +'..HEAD';
  const logs = exec.exec(logScript)
  console.log(`The logs: ${logs}`);
} catch (error) {
  core.setFailed(error.message);
}
