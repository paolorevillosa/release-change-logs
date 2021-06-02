# Release Notes Logs javascript action

**Create Release Notes from GitHub Actions.** This action will generate release notes for your release base on latest tag to HEAD. The idea was base [here](https://blogs.sap.com/2018/06/22/generating-release-notes-from-git-commit-messages-using-basic-shell-commands-gitgrep/) and made a github actions

### Example
```yaml
jobs:
  deployment:
    runs-on: ubuntu-latest
    steps:
    - name: Deploy Stage
      uses: paolorevillosa/release-change-logs@master
      with:
        custom_tag: '{"b":"Bugfix","f": "Feature Added"}'
```


### Inputs
|Argument|  Description  |  Default  |
|--------|---------------|-----------|
custom_tag|Commit Message prefix to find |{"bugfix":"Bugfix","feature": "Features"}


### Response
| Variable |  Description  |
|---|---|
change-logs | Generated Change logs
latest_tag| Latest Tag based on released
logs-on-json | Git log on json format
logs-on-text-file | git log on json format in a text file
