# Release Change Logs javascript action

This action will generate commit logs based on latest tag to HEAD

## Inputs

### `feature`

**Optional** prefix message for feature commits. Add value here to define your custom prefix. Default `"FEATURE"`.

### `bugs`

**Optional** prefix message for feature commits. Add value here to define your custom prefix Default `"BUGFIX"`.

## Outputs

### `time`

The time we greeted you.

## Example usage

uses: actions/hello-world-javascript-action@v1.1
with:
  who-to-greet: 'Mona the Octocat'
