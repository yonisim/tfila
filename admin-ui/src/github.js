import { Octokit } from 'octokit'

export function getOctokit(token) {
  return new Octokit({ auth: token })
}

export async function getUser(octokit) {
  const { data } = await octokit.users.getAuthenticated()
  return data
}

export async function checkBranch(octokit, owner, repo, branch) {
  await octokit.repos.getBranch({ owner, repo, branch })
}

export async function getFileTree(octokit, owner, repo, branch) {
  const { data: ref } = await octokit.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`
  })

  const { data: tree } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: ref.object.sha,
    recursive: 'true'
  })

  return tree.tree
}
