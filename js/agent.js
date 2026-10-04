const me = requireRole("agent");
$("who").textContent = `${me.name} (ID ${me.id})`;
const view = $("view");

const mine = () => DB.get("complaints").filter(c => c.agentId === me.id);
const H = ["ID", "Customer", "Address", "Product", "Description", "Status"];
const row = c => [c.complaintId, c.customerId, c.location, c.product, c.description, { html: tag(c.status) }];

const open = initTabs({
  tasks: () => view.innerHTML = table([...H, "Action"],
    mine().filter(c => c.status !== "CLOSED").map(c =>
      [...row(c), { html: `<button data-close="${c.complaintId}">Close task</button>` }]),
    "No open tasks. New assignments appear here."),

  history: () => view.innerHTML = table(H,
    mine().filter(c => c.status === "CLOSED").map(row), "No closed tasks yet."),

  profile() {
    const a = DB.get("agents").find(x => x.id === me.id);
    view.innerHTML = `<div class="card">${[["ID", a.id], ["Name", a.name], ["Email", a.email],
      ["Contact", a.contact], ["Location", a.location], ["Role", a.role]]
      .map(([k, v]) => `<p><b>${k}:</b> ${esc(v)}</p>`).join("")}</div>`;
  }
});

view.onclick = e => {
  const id = e.target.dataset.close;
  if (!id || !confirm("Close this task?")) return;
  DB.update("complaints", id, { status: "CLOSED" }, "complaintId");
  toast("Task closed.");
  open("tasks");
};
