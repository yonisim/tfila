const clientId = 'YOUR_GITHUB_CLIENT_ID'
const redirectUri = 'https://yonisim.github.io/tfila/'

export function loginWithGitHub() {
  const state = crypto.randomUUID()
  sessionStorage.setItem('oauth_state', state)

  const url =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=repo` +
    `&state=${state}`

  window.location.href = url
}

export async function exchangeCodeForToken(code) {
  // ⚠️ This uses GitHub's public token endpoint via CORS-friendly proxy
  const res = await fetch('https://cors.isomorphic-git.org/https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    body: new URLSearchParams({
      client_id: clientId,
      code
    })
  })

  const data = await res.json()
  return data.access_token
}
