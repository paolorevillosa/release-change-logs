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
  const details = exec.exec('git log $(git describe --tags --abbrev=0)..HEAD    --pretty=format:\'{%n  "commit": "%H",%n  "author": "%aN <%aE>",%n  "date": "%ad",%n  "message": "%f"%n},\'     $@ |     perl -pe \'BEGIN{print "["}; END{print "]\n"}\' |     perl -pe \'s/},]/}]/')


  console.log(`The details: ${details}`);
} catch (error) {
  core.setFailed(error.message);
}
