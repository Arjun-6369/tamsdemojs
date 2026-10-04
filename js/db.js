/* Shared storage, session and UI helpers for TAMS */
const PASSWORDS = { admin: "admin123", agent: "agent123", customer: "customer123" };
const $ = id => document.getElementById(id);

const DB = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } },
  save(k, d) { localStorage.setItem(k, JSON.stringify(d)); },
  add(k, item, idf = "id") {
    const list = this.get(k);
    if (item[idf] && list.some(x => x[idf] == item[idf])) throw new Error("That ID is already taken.");
    if (!item[idf]) item[idf] = Math.max(0, ...list.map(x => x[idf])) + 1;
    list.push(item);
    this.save(k, list);
    return item;
  },
  update(k, id, changes, idf = "id") {
    const list = this.get(k);
    const i = list.findIndex(x => x[idf] == id);
    if (i < 0) throw new Error("Record not found.");
    list[i] = { ...list[i], ...changes };
    this.save(k, list);
    return list[i];
  }
};

const Session = {
  set(u) { sessionStorage.setItem("tams_user", JSON.stringify(u)); },
  get() { try { return JSON.parse(sessionStorage.getItem("tams_user")); } catch { return null; } },
  clear() { sessionStorage.removeItem("tams_user"); }
};

function requireRole(role) {
  const u = Session.get();
  if (!u || u.role !== role) location.href = "../index.html";
  return u;
}
function logout() { Session.clear(); location.href = "../index.html"; }

/* Escape text so user input can never run as HTML (prevents XSS) */
const esc = s => String(s ?? "").replace(/[&<>"']/g,
  c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* Cells are escaped unless passed as {html: "..."} */
function table(headers, rows, empty = "Nothing here yet.") {
  const cell = c => (c && c.html !== undefined ? c.html : esc(c));
  const body = rows.length
    ? rows.map(r => `<tr>${r.map(c => `<td>${cell(c)}</td>`).join("")}</tr>`).join("")
    : `<tr><td class="empty" colspan="${headers.length}">${esc(empty)}</td></tr>`;
  return `<div class="wrap"><table><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></div>`;
}
const tag = s => `<span class="tag ${esc(String(s).toLowerCase())}">${esc(s)}</span>`;

function toast(msg, bad = false) {
  const t = $("toast");
  t.textContent = msg;
  t.className = bad ? "bad" : "";
  t.style.display = "block";
  clearTimeout(toast.t);
  toast.t = setTimeout(() => (t.style.display = "none"), 2600);
}

function initTabs(views) {
  const btns = document.querySelectorAll("#nav button");
  const open = n => {
    btns.forEach(b => b.classList.toggle("active", b.dataset.view === n));
    views[n]();
  };
  btns.forEach(b => (b.onclick = () => open(b.dataset.view)));
  open(btns[0].dataset.view);
  return open;
}

/* Sample data on first run */
if (!localStorage.getItem("tams_seeded")) {
  DB.save("agents", [
    { id: 1, name: "Ravi Kumar", email: "ravi@tams.com", contact: "9876543210", location: "Pune", role: "Technician" },
    { id: 2, name: "Neha Shah", email: "neha@tams.com", contact: "9123456780", location: "Mumbai", role: "Support Engineer" }
  ]);
  DB.save("customers", [
    { id: 1, name: "Asha Patil", email: "asha@mail.com", contact: "9000011111", address: "12 MG Road, Pune" }
  ]);
  DB.save("complaints", []);
  localStorage.setItem("tams_seeded", "1");
}
