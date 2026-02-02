import { useState } from 'react'
import { loginWithGitHubDevice } from './auth'

export default function App() {
  const [status, setStatus] = useState('idle')
  const [code, setCode] = useState(null)
  const [user, setUser] = useState(null)

  const login = async () => {
    try {
      setStatus('auth')

      // returns { login, token }
      const res = await loginWithGitHubDevice(setCode)

      setUser({ login: res.login })
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
          <a href={code.verificationUri} target="_blank" rel="noreferrer">
            {code.verificationUri}
          </a>
        </p>
        <h2>{code.userCode}</h2>
        <p>Waiting for approval…</p>
      </div>
    )
  }

  if (status === 'denied') {
    return <p>Access denied</p>
  }

  return (
    <div>
      <h2>Welcome {user.login}</h2>
      <p>Authenticated</p>
    </div>
  )
}