import * as core from '@actions/core';
import * as github from '@actions/github';
import { run } from './run';

jest.mock('@actions/core');
jest.mock('@actions/github');

describe('run', () => {
    const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;
    const mockSetOutput = core.setOutput as jest.MockedFunction<typeof core.setOutput>;
    const mockSetFailed = core.setFailed as jest.MockedFunction<typeof core.setFailed>;
    const mockInfo = core.info as jest.MockedFunction<typeof core.info>;
    const mockGetOctokit = github.getOctokit as jest.MockedFunction<typeof github.getOctokit>;

    const mockOctokit = {
        rest: {
            repos: {
                compareCommits: jest.fn(),
            },
            codeScanning: {
                listAlertsForRepo: jest.fn(),
            },
        },
        request: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetOctokit.mockReturnValue(mockOctokit as any);
    });

    it('should set impacted_file_touched to true if a changed file matches a CodeScanning alert file', async () => {
        mockGetInput.mockImplementation((name: string) => {
            const inputs: Record<string, string> = {
                github_token: 'test-token',
                repo: 'test-repo',
                owner: 'test-owner',
                before_sha: 'before-sha',
                current_sha: 'current-sha',
            };
            return inputs[name];
        });

        mockOctokit.rest.repos.compareCommits.mockResolvedValue({
            data: {
                files: [{ filename: 'src/vulnerable-file.js' }],
            },
        });

        mockOctokit.rest.codeScanning.listAlertsForRepo.mockResolvedValue({
            data: [
                {
                    most_recent_instance: {
                        location: {
                            path: 'src/vulnerable-file.js',
                        },
                    },
                },
            ],
        });

        mockOctokit.request.mockResolvedValue({ data: [] });

        await run();

        expect(mockSetOutput).toHaveBeenCalledWith('impacted_file_touched', 'true');
        expect(mockInfo).toHaveBeenCalledWith('CodeScanning matching file: src/vulnerable-file.js');
    });

    it('should set impacted_file_touched to true if a changed file matches a Dependabot alert file', async () => {
        mockGetInput.mockImplementation((name: string) => {
            const inputs: Record<string, string> = {
                github_token: 'test-token',
                repo: 'test-repo',
                owner: 'test-owner',
                before_sha: 'before-sha',
                current_sha: 'current-sha',
            };
            return inputs[name];
        });

        mockOctokit.rest.repos.compareCommits.mockResolvedValue({
            data: {
                files: [{ filename: 'package.json' }],
            },
        });

        mockOctokit.rest.codeScanning.listAlertsForRepo.mockResolvedValue({ data: [] });

        mockOctokit.request.mockResolvedValue({
            data: [
                {
                    dependency: {
                        manifest_path: 'package.json',
                    },
                },
            ],
        });

        await run();

        expect(mockSetOutput).toHaveBeenCalledWith('impacted_file_touched', 'true');
        expect(mockInfo).toHaveBeenCalledWith('Dependabot matching file: package.json');
    });

    it('should set impacted_file_touched to false if no changed files match alert files', async () => {
        mockGetInput.mockImplementation((name: string) => {
            const inputs: Record<string, string> = {
                github_token: 'test-token',
                repo: 'test-repo',
                owner: 'test-owner',
                before_sha: 'before-sha',
                current_sha: 'current-sha',
            };
            return inputs[name];
        });

        mockOctokit.rest.repos.compareCommits.mockResolvedValue({
            data: {
                files: [{ filename: 'src/other-file.js' }],
            },
        });

        mockOctokit.rest.codeScanning.listAlertsForRepo.mockResolvedValue({ data: [] });

        mockOctokit.request.mockResolvedValue({ data: [] });

        await run();

        expect(mockSetOutput).toHaveBeenCalledWith('impacted_file_touched', 'false');
        expect(mockInfo).toHaveBeenCalledWith('Final decision: impacted_file_touched=false');
    });

    it('should call core.setFailed if an error is thrown', async () => {
        mockGetInput.mockImplementation(() => {
            throw new Error('Test error');
        });

        await run();

        expect(mockSetFailed).toHaveBeenCalledWith('Test error');
    });
});