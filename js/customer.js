const me = requireRole("customer");
$("who").textContent = `${me.name} (ID ${me.id})`;
const view = $("view");

const open = initTabs({
  complaint() {
    view.innerHTML = `<form class="card" id="f">
      <label>Your address<textarea name="location" required></textarea></label>
      <label>Product<input name="product" required></label>
      <label>What went wrong?<textarea name="description" required></textarea></label>
      <button>Submit complaint</button></form>`;
    $("f").onsubmit = e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      const c = DB.add("complaints", { ...d, customerId: me.id, agentId: null,
        status: "PENDING", createdAt: new Date().toISOString() }, "complaintId");
      toast(`Complaint #${c.complaintId} submitted.`);
      open("track");
    };
  },

  track: () => view.innerHTML = table(
    ["ID", "Agent", "Address", "Product", "Description", "Status"],
    DB.get("complaints").filter(c => c.customerId === me.id).map(c =>
      [c.complaintId, c.agentId ?? "Not assigned yet", c.location, c.product, c.description, { html: tag(c.status) }]),
    "You have no complaints yet.")
});
