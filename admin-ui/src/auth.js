// admin-ui/src/auth.js

// export const MY_API = "https://tfila-admin." + "vercel.app";

async function getApiConfig() {
  const res = await fetch("config.json");
  if (!res.ok) throw new Error("Failed to load config.json");
  return res.json();
}

export async function loginWithGitHubDevice(onCode) {
  const config = await getApiConfig();
  const MY_API = config.MY_API;
  
  // 1. start device flow
  console.log("API=" + `${MY_API}/api/start`);
  const start = await fetch(`${MY_API}/api/start`).then(r => r.json());

  onCode({
    userCode: start.user_code,
    verificationUri: start.verification_uri
  });
  console.log("After start")
  // 2. poll backend until approved
  while (true) {
    await new Promise(r => setTimeout(r, start.interval * 1000));
    console.log("Sending poll api request to vercel");
    const res = await fetch(`https://tfila-admin.vercel.app/api//poll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_code: start.device_code })
    }).then(r => r.json());
    console.log("After poll");
    console.log("Token" + res.token);

    if (res.ok) {
      localStorage.token = res.token;
      return res; // { login, token }
    }

    if (res.error && res.error !== "authorization_pending") {
      throw new Error(res.error);
    }
  }
}
