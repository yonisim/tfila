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

    const mapping = await res.json();

    renderTable(mapping);

  } catch (err) {
    console.error(err);
    alert("Failed to fetch Shabat data");
  }
}

function renderTable(mapping) {
  const container = document.getElementById("shabat-table-container");
  container.innerHTML = "";

  const entries = Object.entries(mapping)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.width = "100%";

  const headerRow = `
    <tr>
      <th>Date</th>
      <th>Parasha</th>
      <th>In</th>
      <th>Out</th>
      <th>Mevarchim</th>
      <th>Messages</th>
    </tr>
  `;

  table.innerHTML = headerRow;

  entries.forEach(item => {
    const mevarchim = item.mevarchim
      ? `${item.mevarchim.hodesh_name} (${(item.mevarchim.days || []).join(", ")})`
      : "";

    const messages = item.messages
      ? item.messages.join("<br>")
      : "";

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.date}</td>
      <td>${item.parasha || ""}</td>
      <td>${item.in || ""}</td>
      <td>${item.out || ""}</td>
      <td>${mevarchim}</td>
      <td>${messages}</td>
    `;

    Array.from(row.children).forEach(td => {
      td.style.border = "1px solid #ccc";
      td.style.padding = "6px";
    });

    table.appendChild(row);
  });

  container.appendChild(table);
}

window.fetchShabat = fetchShabat;
