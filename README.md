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
          github_token: ${{ secrets.GH_PAT }}
```

The GH_PAT token should contain the following permissions: Read access to Dependabot alerts, code, metadata, pull requests, and security events.

## Development

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/lfventura/detect-merge-bypass-action.git
cd detect-merge-bypass-action
npm install
```

### Linting

Check the code for linting issues:

```bash
npm run lint
```

Automatically fix linting issues:

```bash
npm run lintfix
```

### Build

Build the project for production:

```bash
npm run build
```

## How it works

This GitHub Action is designed to detect if any files modified in a commit or pull request are associated with security alerts. Here's how it works:

1. **Fetches changed files**:
   - The action retrieves the list of files modified between two commits (`before_sha` and `current_sha`) using the GitHub API.

2. **Retrieves security alerts**:
   - **Code Scanning Alerts**: The action fetches open Code Scanning alerts in the repository and identifies the files associated with these alerts.
   - **Dependabot Alerts**: The action retrieves Dependabot alerts and identifies the manifest files related to these alerts.

3. **Compares the files**:
   - The action compares the list of modified files with the files associated with security alerts (from Code Scanning and Dependabot).
   - If any modified file matches a file associated with a security alert, it is flagged as impacted.

4. **Sets the output**:
   - The action sets the output variable `impacted_file_touched` to `true` if any impacted files were modified, otherwise `false`.

5. **Logs the results**:
   - The action logs detailed information about the matching files and the final decision (`impacted_file_touched` value) for debugging and transparency.

This process ensures that any changes to files with active security alerts are detected and flagged for further review.

## License

```
This project is licensed under the terms of the MIT license.
```