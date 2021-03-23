const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');

async function main() {

  try {
    // `who-to-greet` input defined in action metadata file
    const nameToGreet = core.getInput('who-to-greet');
    console.log(`Hello ${nameToGreet}!`);
    const time = (new Date()).toTimeString();
    core.setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2);

    await exec.exec('git fetch');
    const latestRelease = await exec.exec('git describe --tags --abbrev=0');


    console.log(`latest tag: ${latestRelease}`);
    const logScript = `git log ${latestRelease}..HEAD`;


    console.log(`logScript: ${logScript}`);
    const logs = exec.exec(logScript)
    console.log(`The logs: ${logs}`);
  } catch (error) {
    core.setFailed(error.message);
  }  
}

main();


