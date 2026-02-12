// admin-ui/src/auth.js

export const MY_API = "https://tfila-admin.vercel.app";
export async function loginWithGitHubDevice(onCode) {
  
  // 1. start device flow
  console.log("API=" + `https://tfila-admin.vercel.app/api/start`);
  const start = await fetch(`https://tfila-admin.vercel.app/api/start`).then(r => r.json());

  onCode({
    userCode: start.user_code,
    verificationUri: start.verification_uri
  });

  // 2. poll backend until approved
  while (true) {
    await new Promise(r => setTimeout(r, start.interval * 1000));

    const res = await fetch(`${API}/api/auth/poll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_code: start.device_code })
    }).then(r => r.json());

    if (res.ok) {
      localStorage.token = res.token;
      return res; // { login, token }
    }

    if (res.error && res.error !== "authorization_pending") {
      throw new Error(res.error);
    }
  }
}
