# detect-edited-files-with-security-alerts-action

This GitHub Action checks if files edited in a pull request or commit are associated with security alerts, such as Code Scanning or Dependabot.

## How it works

The action performs the following steps:

1. **Fetches changed files**:
   - Compares the `before_sha` and `current_sha` commits to identify modified files.

2. **Checks for security alerts**:
   - Retrieves Code Scanning and Dependabot alerts in the repository.

3. **Compares the files**:
   - Checks if any of the modified files are associated with security alerts.

4. **Sets the output**:
   - Sets the output `impacted_file_touched` to `true` or `false`, depending on whether impacted files were modified.

## Inputs

```
- github_token: GitHub authentication token (required).
- repo: Repository name (optional, default: current repository context).
- owner: Repository owner (optional, default: current repository context).
- before_sha: SHA of the previous commit (optional, default: event context).
- current_sha: SHA of the current commit (optional, default: event context).
```

## Outputs

```
- impacted_file_touched: Indicates whether files associated with security alerts were modified (`true` or `false`).
```

## Example Usage

```yaml
name: Detect Edited Files with Security Alerts

on:
  push:
    branches:
      - main

jobs:
  check-security-alerts:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Run detect-edited-files-with-security-alerts-action
        uses: lfventura/detect-edited-files-with-security-alerts-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

## Local Development

To test the action locally, you can use the following command:

```bash
node dist/index.js
```

Make sure to provide an `event.json` file with the required context.

## License

```
This project is licensed under the terms of the MIT license.
```