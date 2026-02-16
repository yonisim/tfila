async function fetchShabat() {
  try {
    if (!window.idToken) {
      alert("Not authenticated");
      return;
    }

    const res = await fetch("https://tfila-admin.vercel.app/api/shabat", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${window.idToken}`
      }
    });

    if (!res.ok) {
      throw new Error("Request failed");
    }

    const data = await res.json();

    document.getElementById("shabat-result").textContent =
      JSON.stringify(data, null, 2);

  } catch (err) {
    console.error(err);
    alert("Failed to fetch Shabat data");
  }
}

window.fetchShabat = fetchShabat;
