import { useState } from 'react'
import { loginWithGitHubDevice } from './auth'

const OWNER = 'yonisim'
const REPO = 'tfila'

export default function App() {
  const [status, setStatus] = useState('idle')
  const [code, setCode] = useState(null)
  const [files, setFiles] = useState([])
  const [user, setUser] = useState(null)

  const login = async () => {
    try {
      setStatus('auth')

      const octokit = await loginWithGitHubDevice(setCode)

      const { data: me } = await octokit.rest.users.getAuthenticated()
      setUser(me)

      const branch = me.login   // ✅ branch = username

      // hard permission check
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
  }

  if (status === 'idle') {
    return <button onClick={login}>Login with GitHub</button>
  }

  if (status === 'auth' && code) {
    return (
      <div>
        <p>Authorize this app:</p>
        <p>
          Go to{' '}
          <a href={code.verificationUri} target="_blank">
            {code.verificationUri}
          </a>
        </p>
        <h2>{code.userCode}</h2>
        <p>Waiting for approval…</p>
      </div>
    )
  }

  if (status === 'denied') {
    return <p>Access denied (branch missing or no permission)</p>
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