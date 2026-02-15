let idToken = null;

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

window.handleCredentialResponse = function (response) {
  idToken = response.credential;

  const payload = parseJwt(idToken);
  const email = payload.email;

  document.getElementById("user-email").textContent = email;
  document.getElementById("login-container").style.display = "none";
  document.getElementById("user").style.display = "block";

  console.log("ID Token:", idToken);
};

function logout() {
  idToken = null;
  google.accounts.id.disableAutoSelect();

  document.getElementById("login-container").style.display = "block";
  document.getElementById("user").style.display = "none";
}
