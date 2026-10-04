const role = $("role");
const msg = t => ($("msg").textContent = t);

role.onchange = () => ($("idRow").hidden = !role.value || role.value === "admin");

$("loginForm").onsubmit = e => {
  e.preventDefault();
  const r = role.value;
  if (PASSWORDS[r] !== $("password").value) return msg("Wrong password.");
  if (r === "admin") {
    Session.set({ role: r, name: "Administrator" });
    return (location.href = "admin/admin.html");
  }
  const id = Number($("uid").value);
  const user = DB.get(r === "agent" ? "agents" : "customers").find(x => x.id === id);
  if (!user) return msg(`No ${r} found with ID ${$("uid").value || "(empty)"}.`);
  Session.set({ role: r, id: user.id, name: user.name });
  location.href = `${r}/${r}.html`;
};

$("regForm").onsubmit = e => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target));
  const c = DB.add("customers", d);
  e.target.reset();
  role.value = "customer";
  role.onchange();
  $("uid").value = c.id;
  msg(`Registered. Your customer ID is ${c.id}. Enter the password to log in.`);
};
