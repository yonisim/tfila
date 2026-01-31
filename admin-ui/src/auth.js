import { Octokit } from 'octokit'

const CLIENT_ID = 'Ov23liIfEwayEZsF860Y'

export async function loginWithGitHubDevice(onCode) {
  const octokit = new Octokit({
    authStrategy: Octokit.authStrategy.device,
    auth: {
      clientId: CLIENT_ID,
      scopes: ['repo'],
      onVerification(verification) {
        onCode({
          userCode: verification.user_code,
          verificationUri: verification.verification_uri
        })
      }
    }
  })

  // this will block (poll) until approved
  await octokit.auth()

  return octokit
}