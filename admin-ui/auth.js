window.idToken = null;

async function getApiConfig() {
  const res = await fetch("config.json");
  if (!res.ok) throw new Error("Failed to load config.json");
  return res.json();
}
const BACKEND_URL = "https://tfila-admin.vercel.app";

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

window.handleCredentialResponse = async function (response) {
  try {
    idToken = response.credential;
    window.idToken = idToken;
    console.log("Token: " + idToken);
    const payload = parseJwt(idToken);
    const email = payload.email;
    const config = await getApiConfig();
    const MY_API = config.MY_API;
    const verifyRes = await fetch(`${MY_API}/api/verify`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${idToken}`
      }
    });

    if (!verifyRes.ok) {
      throw new Error("Unauthorized");
    }

    const data = await verifyRes.json();

    document.getElementById("user-email").textContent = data.email;
    document.getElementById("login-container").style.display = "none";
    document.getElementById("user").style.display = "block";

  } catch (err) {
    console.error(err);
    alert("Access denied");
    logout();
  }
};

function logout() {
  idToken = null;
  window.idToken = null;
  google.accounts.id.disableAutoSelect();

  document.getElementById("login-container").style.display = "block";
  document.getElementById("user").style.display = "none";
}
