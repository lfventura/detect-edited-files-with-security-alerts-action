import * as core from '@actions/core';
import * as github from '@actions/github';

export async function run(): Promise<void> {
  try {
    const token: string = core.getInput('github_token');
    const octokit: ReturnType<typeof github.getOctokit> = github.getOctokit(token);

    const repo: string = core.getInput('repo') || github.context.repo.repo;
    const owner: string = core.getInput('owner') || github.context.repo.owner;
    const beforeSha: string = core.getInput('before_sha') || github.context.payload.before;
    const currentSha: string = core.getInput('current_sha') || github.context.payload.after;

    // If it is a new branch, we don't have to run the action
    if (beforeSha === '0000000000000000000000000000000000000000') {
      core.info('Branch created, skipping action.');
      core.setOutput('impacted_file_touched', 'false');
      core.info("Final decision: impacted_file_touched=false");
      return;
    }

    // Get changed files
    core.info('Fetching changed files...');
    const compareCommits = await octokit.rest.repos.compareCommits({
      owner,
      repo,
      base: beforeSha,
      head: currentSha,
    });
    
    const changedFiles = (compareCommits.data.files ?? []).map(file => file.filename);

    // Get CodeScanning Alerts
    const codeScanningAlertsResponse = await octokit.rest.codeScanning.listAlertsForRepo({
      owner,
      repo,
      state: 'open',
    });

    const codeScanningFiles = codeScanningAlertsResponse.data
      .map(alert => alert.most_recent_instance?.location?.path)
      .filter((path): path is string => path !== undefined);

    // Get Dependabot alerts
    const dependabotAlertsResponse = await octokit.request(`GET /repos/${owner}/${repo}/dependabot/alerts`, {
      headers: { Accept: 'application/vnd.github+json' },
    });

    interface DependabotAlert {
      dependency: {
        manifest_path: string;
      };
    }

    const dependabotFiles = (dependabotAlertsResponse.data as DependabotAlert[]).map(alert => alert.dependency.manifest_path);

    // Evaluate impacted files
    let impactedFileTouched = false;

    for (const file of codeScanningFiles) {
      if (changedFiles.includes(file)) {
        core.info(`CodeScanning matching file: ${file}`);
        impactedFileTouched = true;
      }
    }

    for (const file of dependabotFiles) {
      if (changedFiles.includes(file)) {
        core.info(`Dependabot matching file: ${file}`);
        impactedFileTouched = true;
      }
    }

    core.setOutput('impacted_file_touched', impactedFileTouched.toString());
    core.info(`Final decision: impacted_file_touched=${impactedFileTouched}`);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed(String(error));
    }
  }
}