import { useEffect, useState } from 'react'
import { loginWithGitHub, exchangeCodeForToken } from './auth'
import { getOctokit, getUser, checkBranch, getFileTree } from './github'

const OWNER = 'yonisim'
const REPO = 'tfila'

export default function App() {
  const [status, setStatus] = useState('init')
  const [files, setFiles] = useState([])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (!code) return

    ;(async () => {
      setStatus('authenticating')
      const token = await exchangeCodeForToken(code)
      const octokit = getOctokit(token)

      const user = await getUser(octokit)
      const branch = user.login   // 👈 branch == username

      try {
        await checkBranch(octokit, OWNER, REPO, branch)
      } catch {
        setStatus('denied')
        return
      }

      const tree = await getFileTree(octokit, OWNER, REPO, branch)
      setFiles(tree)
      setStatus('ready')
    })()
  }, [])

  if (status === 'init')
    return <button onClick={loginWithGitHub}>Login with GitHub</button>

  if (status === 'authenticating')
    return <p>Logging in…</p>

  if (status === 'denied')
    return <p>Access denied (branch not found or no permission)</p>

  return (
    <div>
      <h2>Repository Files</h2>
      <ul>
        {files.map(f => (
          <li key={f.path}>{f.path}</li>
        ))}
      </ul>
    </div>
  )
}
