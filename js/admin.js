
requireRole("admin");
$("who").textContent = "Administrator";
const view = $("view");

const open = initTabs({
  agents: () => view.innerHTML = table(
    ["ID", "Name", "Email", "Contact", "Location", "Role"],
    DB.get("agents").map(a => [a.id, a.name, a.email, a.contact, a.location, a.role])),

  customers: () => view.innerHTML = table(
    ["ID", "Name", "Email", "Contact", "Address"],
    DB.get("customers").map(c => [c.id, c.name, c.email, c.contact, c.address])),

  complaints() {
    const opts = `<option value="">Assign to…</option>` +
      DB.get("agents").map(a => `<option value="${a.id}">${esc(a.id + " - " + a.name)}</option>`).join("");
    view.innerHTML = table(
      ["ID", "Customer", "Agent", "Address", "Product", "Description", "Status", "Assign"],
      DB.get("complaints").map(c => [
        c.complaintId, c.customerId, c.agentId ?? "Not assigned", c.location, c.product, c.description,
        { html: tag(c.status) },
        c.status === "CLOSED" ? "-" : { html: `<select data-id="${c.complaintId}">${opts}</select>` }
      ]), "No complaints yet.");
  },

  addAgent() {
    view.innerHTML = `<form class="card" id="f">
      <label>Agent ID (leave blank for automatic)<input name="id" type="number" min="1"></label>
      <label>Name<input name="name" required></label>
      <label>Email<input name="email" type="email" required></label>
      <label>Contact<input name="contact" type="tel" required></label>
      <label>Location<input name="location" required></label>
      <label>Role<input name="role" required></label>
      <button>Add agent</button></form>`;
    $("f").onsubmit = e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      d.id = Number(d.id) || undefined;
      try { DB.add("agents", d); toast("Agent added."); open("agents"); }
      catch (err) { toast(err.message, true); }
    };
  }
});

view.onchange = e => {
  const id = e.target.dataset.id;
  if (!id || !e.target.value) return;
  DB.update("complaints", id, { agentId: Number(e.target.value), status: "ASSIGNED" }, "complaintId");
  toast("Agent assigned.");
  open("complaints");
};
