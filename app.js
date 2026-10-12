document.documentElement.classList.add("js-ready");

const links = window.EMBERSTACK_LINKS ?? {};
document.querySelectorAll(".external-link[data-link]").forEach((link) => {
  const destination = links[link.dataset.link]?.trim();
  if (destination) {
    link.href = destination;
    link.removeAttribute("aria-disabled");
  } else {
    link.classList.add("link-pending");
    link.removeAttribute("target");
    link.setAttribute("aria-disabled", "true");
    link.title = "Add the official URL in site-config.js";
    link.addEventListener("click", (event) => event.preventDefault());
  }
});

const content = window.EMBERSTACK_CONTENT ?? { projects: [], updates: [] };
const projects = Array.isArray(content.projects) ? content.projects : [];
const updates = Array.isArray(content.updates) ? content.updates : [];
const projectGrid = document.querySelector("#project-grid");
const searchInput = document.querySelector("#project-search");
const statusFilter = document.querySelector("#filter-status");
const versionFilter = document.querySelector("#filter-version");
const loaderFilter = document.querySelector("#filter-loader");

function fillFilter(select, values, label) {
  [...new Set(values.flat().filter(Boolean).map(String))].sort().forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
  if (values.flat().length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No versions listed yet";
    option.disabled = true;
    select.append(option);
    select.setAttribute("aria-label", `${label}: no projects configured`);
  }
}

fillFilter(versionFilter, projects.map((project) => project.versions ?? []), "Minecraft version");
fillFilter(loaderFilter, projects.map((project) => project.loaders ?? []), "Mod loader");

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

const detailDialog = document.createElement("dialog");
detailDialog.className = "project-dialog";
detailDialog.setAttribute("aria-labelledby", "dialog-title");
detailDialog.innerHTML = `<button class="dialog-close" type="button" aria-label="Close project details">×</button><div class="dialog-status"></div><h2 id="dialog-title"></h2><p class="dialog-description"></p><div class="dialog-meta"></div><div class="dialog-section"><h3>About this project</h3><p class="dialog-about"></p></div><div class="dialog-section dialog-notes-wrap"><h3>Install notes</h3><p class="dialog-notes"></p></div><div class="dialog-actions"></div>`;
document.body.append(detailDialog);
detailDialog.querySelector(".dialog-close").addEventListener("click", () => detailDialog.close());
detailDialog.addEventListener("click", (event) => {
  if (event.target === detailDialog) detailDialog.close();
});

function addDestination(container, label, destination, className = "dialog-link") {
  if (!destination) return;
  const anchor = makeElement("a", className, label);
  anchor.href = destination;
  anchor.target = "_blank";
  anchor.rel = "noreferrer";
  container.append(anchor);
}

function showProject(project) {
  const status = detailDialog.querySelector(".dialog-status");
  status.textContent = (project.statusLabel ?? project.status ?? "Project").toUpperCase();
  detailDialog.querySelector("#dialog-title").textContent = project.name ?? "Untitled project";
  detailDialog.querySelector(".dialog-description").textContent = project.description ?? "Project details will be shared soon.";
  detailDialog.querySelector(".dialog-about").textContent = project.details ?? project.description ?? "More details coming soon.";
  const notes = project.installNotes ?? "Follow the instructions on the linked release page.";
  detailDialog.querySelector(".dialog-notes").textContent = notes;
  detailDialog.querySelector(".dialog-notes-wrap").hidden = !notes;
  const meta = detailDialog.querySelector(".dialog-meta");
  meta.replaceChildren();
  [["Minecraft", project.versions], ["Loader", project.loaders], ["Type", project.type ? [project.type] : []]].forEach(([label, values]) => {
    if (!values?.length) return;
    meta.append(makeElement("span", "meta-chip", `${label}: ${values.join(", ")}`));
  });
  const actions = detailDialog.querySelector(".dialog-actions");
  actions.replaceChildren();
  addDestination(actions, "Open on Modrinth ↗", project.modrinthUrl, "button button-primary dialog-primary");
  addDestination(actions, "Source on GitHub ↗", project.githubUrl);
  detailDialog.showModal();
}

function renderProjects() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = projects.filter((project) => {
    const text = [project.name, project.type, project.description, project.statusLabel, ...(project.versions ?? []), ...(project.loaders ?? [])].join(" ").toLowerCase();
    const matchesStatus = statusFilter.value === "all" || project.status === statusFilter.value;
    const matchesVersion = versionFilter.value === "all" || (project.versions ?? []).includes(versionFilter.value);
    const matchesLoader = loaderFilter.value === "all" || (project.loaders ?? []).includes(loaderFilter.value);
    return text.includes(query) && matchesStatus && matchesVersion && matchesLoader;
  });
  projectGrid.replaceChildren();
  if (!filtered.length) {
    const empty = makeElement("div", "catalog-empty");
    empty.append(makeElement("span", "empty-spark", "✳"));
    const heading = makeElement("h3", "", projects.length ? "No projects match those filters" : "Project listings are on the way");
    const message = makeElement("p", "", projects.length ? "Try a different search or clear a filter." : "We haven’t added verified release details yet. Browse the official Modrinth page for published Emberstack projects.");
    empty.append(heading, message);
    if (!projects.length && links.modrinth) addDestination(empty, "Browse Emberstack on Modrinth ↗", links.modrinth, "empty-link");
    projectGrid.append(empty);
    return;
  }
  filtered.forEach((project) => {
    const card = makeElement("article", "catalog-card");
    const top = makeElement("div", "catalog-card-top");
    const statusClass = `catalog-status status-${project.status ?? "consideration"}`;
    top.append(makeElement("span", statusClass, project.statusLabel ?? project.status ?? "Project"));
    top.append(makeElement("span", "catalog-type", project.type ?? "MINECRAFT PROJECT"));
    card.append(top);
    if (project.image) {
      const image = document.createElement("img");
      image.className = "catalog-image";
      image.src = project.image;
      image.alt = project.imageAlt ?? `${project.name} preview`;
      image.loading = "lazy";
      card.append(image);
    }
    card.append(makeElement("h3", "", project.name ?? "Untitled project"));
    card.append(makeElement("p", "catalog-description", project.description ?? "More details coming soon."));
    const tags = makeElement("div", "catalog-tags");
    [...(project.versions ?? []).map((version) => `MC ${version}`), ...(project.loaders ?? [])].forEach((tag) => tags.append(makeElement("span", "meta-chip", tag)));
    card.append(tags);
    const footer = makeElement("div", "catalog-card-footer");
    const detailsButton = makeElement("button", "details-button", "Project details ↗");
    detailsButton.type = "button";
    detailsButton.addEventListener("click", () => showProject(project));
    footer.append(detailsButton);
    if (project.modrinthUrl) {
      const download = makeElement("a", "catalog-download", "Download ↗");
      download.href = project.modrinthUrl;
      download.target = "_blank";
      download.rel = "noreferrer";
      footer.append(download);
    }
    card.append(footer);
    projectGrid.append(card);
  });
}

[searchInput, statusFilter, versionFilter, loaderFilter].forEach((control) => control.addEventListener("input", renderProjects));
[statusFilter, versionFilter, loaderFilter].forEach((control) => control.addEventListener("change", renderProjects));
renderProjects();

const updatesList = document.querySelector("#updates-list");
if (!updates.length) {
  const empty = makeElement("div", "updates-empty");
  empty.append(makeElement("span", "empty-spark", "✳"), makeElement("h3", "", "No updates posted yet"), makeElement("p", "", "Release notes and announcements will show up here when Emberstack has news to share."));
  updatesList.append(empty);
} else {
  updates.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).forEach((update) => {
    const row = makeElement("article", "update-row");
    const date = makeElement("time", "update-date", update.date ?? "");
    if (update.date) date.dateTime = update.date;
    row.append(date);
    const body = makeElement("div", "update-body");
    body.append(makeElement("span", "update-category", update.category ?? "UPDATE"), makeElement("h3", "", update.title ?? "Project update"), makeElement("p", "", update.summary ?? ""));
    row.append(body);
    if (update.project) row.append(makeElement("span", "update-project", update.project));
    updatesList.append(row);
  });
}

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav-links");
menuToggle?.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
  nav.classList.toggle("nav-open", !expanded);
});
nav?.querySelectorAll("a:not(.link-pending)").forEach((link) => link.addEventListener("click", () => {
  menuToggle?.setAttribute("aria-expanded", "false");
  nav.classList.remove("nav-open");
}));
document.querySelector("#year").textContent = new Date().getFullYear();

