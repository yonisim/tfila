import { useEffect, useState } from 'react'
import { loginWithGitHub, exchangeCodeForToken } from './auth'
import { Octokit } from 'octokit'

const OWNER = 'yonisim'
const REPO = 'tfila'

export default function App() {
  const [status, setStatus] = useState('init')
  const [files, setFiles] = useState([])
  const [user, setUser] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (!code) return

    ;(async () => {
      try {
        setStatus('authenticating')

        const token = await exchangeCodeForToken(code)
        const octokit = new Octokit({ auth: token })

        const { data: me } = await octokit.rest.users.getAuthenticated()
        setUser(me)

        const branch = me.login

        // branch must exist and user must have access
        await octokit.rest.repos.getBranch({
          owner: OWNER,
          repo: REPO,
          branch
        })

        const ref = await octokit.rest.git.getRef({
          owner: OWNER,
          repo: REPO,
          ref: `heads/${branch}`
        })

        const tree = await octokit.rest.git.getTree({
          owner: OWNER,
          repo: REPO,
          tree_sha: ref.data.object.sha,
          recursive: 'true'
        })

        setFiles(tree.data.tree)
        setStatus('ready')
      } catch (e) {
        console.error(e)
        setStatus('denied')
      }
    })()
  }, [])

  if (status === 'init') {
    return <button onClick={loginWithGitHub}>Login with GitHub</button>
  }

  if (status === 'authenticating') {
    return <p>Logging in…</p>
  }

  if (status === 'denied') {
    return <p>Access denied (no matching branch)</p>
  }

  return (
    <div>
      <h2>Welcome {user.login}</h2>
      <h3>Branch: {user.login}</h3>
      <ul>
        {files.map(f => (
          <li key={f.path}>{f.path}</li>
        ))}
      </ul>
    </div>
  )
}