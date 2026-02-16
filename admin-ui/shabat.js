async function fetchShabat() {
  if (!window.idToken) {
    alert("Not authenticated");
    return;
  }

  const res = await fetch("https://tfila-admin.vercel.app/api/shabat", {
    headers: { Authorization: `Bearer ${window.idToken}` }
  });

  const mapping = await res.json();
  renderTable(mapping);
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

  table.innerHTML = `
    <tr>
      <th>Date</th>
      <th>Parasha</th>
      <th>In</th>
      <th>Out</th>
      <th>Mevarchim</th>
      <th>Messages</th>
      <th>Actions</th>
    </tr>
  `;

  entries.forEach(item => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.date}</td>
      <td>${item.parasha || ""}</td>
      <td>${item.in || ""}</td>
      <td>${item.out || ""}</td>
      <td>${formatMevarchim(item.mevarchim)}</td>
      <td>${formatMessages(item.messages)}</td>
      <td><button>Edit</button></td>
    `;

    row.querySelector("button").onclick = () =>
      enterEditMode(row, item);

    Array.from(row.children).forEach(td => {
      td.style.border = "1px solid #ccc";
      td.style.padding = "6px";
    });

    table.appendChild(row);
  });

  container.appendChild(table);
}

function formatMevarchim(m) {
  if (!m) return "";
  return `${m.hodesh_name} (${(m.days || []).join(", ")})`;
}

function formatMessages(messages) {
  if (!messages) return "";
  return messages.join("<br>");
}

function enterEditMode(row, item) {
  row.innerHTML = `
    <td>${item.date}</td>
    <td><input value="${item.parasha || ""}"></td>
    <td><input value="${item.in || ""}"></td>
    <td><input value="${item.out || ""}"></td>
    <td>
      <input placeholder="Hodesh" value="${item.mevarchim?.hodesh_name || ""}">
      <input placeholder="Days comma separated" value="${(item.mevarchim?.days || []).join(",")}">
    </td>
    <td>
      <textarea rows="2">${(item.messages || []).join("\n")}</textarea>
    </td>
    <td>
      <button>Save</button>
    </td>
  `;

  row.querySelector("button").onclick = () =>
    saveRow(row, item.date);
}

async function saveRow(row, date) {
  const inputs = row.querySelectorAll("input");
  const textarea = row.querySelector("textarea");

  const updated = {
    parasha: inputs[0].value,
    in: inputs[1].value,
    out: inputs[2].value
  };

  const hodesh = inputs[3].value.trim();
  const daysRaw = inputs[4].value.trim();

  if (hodesh) {
    updated.mevarchim = {
      hodesh_name: hodesh,
      days: daysRaw ? daysRaw.split(",").map(d => d.trim()) : []
    };
  }

  const messagesRaw = textarea.value.trim();
  if (messagesRaw) {
    updated.messages = messagesRaw.split("\n");
  }

  const res = await fetch(
    "https://tfila-admin.vercel.app/api/shabat/update",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${window.idToken}`
      },
      body: JSON.stringify({ date, updated })
    }
  );

  if (!res.ok) {
    alert("Update failed");
    return;
  }

  alert("Updated successfully");
  fetchShabat(); // reload table
}

window.fetchShabat = fetchShabat;
