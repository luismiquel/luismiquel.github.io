const $ = (sel) => document.querySelector(sel);

function setYear() {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
}

async function loadApps() {
  const res = await fetch("/assets/apps.json", { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar apps.json");
  return res.json();
}

function uniq(arr) {
  return [...new Set(arr)].filter(Boolean);
}

function appCard(app) {
  const demo = app.demoUrl ? `<a class="btn small" href="${app.demoUrl}" target="_blank" rel="noopener">Demo</a>` : "";
  const buy = app.buyUrl ? `<a class="btn small primary" href="${app.buyUrl}" target="_blank" rel="noopener">Comprar</a>` : "";
  const badge = app.category ? `<span class="badge">${app.category}</span>` : "";

  return `
  <article class="card">
    <div class="card-top">
      <h3>${app.name}</h3>
      ${badge}
    </div>
    <p class="muted">${app.tagline || ""}</p>
    <p class="price">${app.priceText || ""}</p>
    <div class="row">
      <a class="btn small" href="/app.html?slug=${encodeURIComponent(app.slug)}">Ver detalles</a>
      ${demo}
      ${buy}
    </div>
  </article>`;
}

function renderCatalog(apps) {
  const grid = $("#apps");
  if (!grid) return;

  const search = $("#search");
  const filter = $("#filter");

  const categories = uniq(apps.map(a => a.category));
  categories.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    filter.appendChild(opt);
  });

  function apply() {
    const q = (search.value || "").toLowerCase().trim();
    const f = filter.value;

    const filtered = apps.filter(a => {
      const hay = `${a.name} ${a.tagline} ${a.problem} ${a.who} ${(a.features||[]).join(" ")}`.toLowerCase();
      const okQ = !q || hay.includes(q);
      const okF = (f === "all") || (a.category === f);
      return okQ && okF && (a.status !== "hidden");
    });

    grid.innerHTML = filtered.length
      ? filtered.map(appCard).join("")
      : `<div class="card"><p>No hay resultados. Prueba otra búsqueda.</p></div>`;
  }

  search?.addEventListener("input", apply);
  filter?.addEventListener("change", apply);
  apply();
}

function renderDetail(app) {
  const box = $("#detail");
  if (!box) return;

  const demo = app.demoUrl ? `<a class="btn" href="${app.demoUrl}" target="_blank" rel="noopener">Probar demo</a>` : "";
  const buy = app.buyUrl ? `<a class="btn primary" href="${app.buyUrl}" target="_blank" rel="noopener">Comprar</a>` : "";
  const feats = (app.features || []).map(f => `<span class="chip">${f}</span>`).join("");

  box.innerHTML = `
    <div class="detail-head">
      <div>
        <h1>${app.name}</h1>
        <p class="sub">${app.tagline || ""}</p>
      </div>
      <div class="detail-cta">
        <div class="price big">${app.priceText || ""}</div>
        <div class="row">${demo}${buy}<a class="btn" href="/contact.html">Preguntar</a></div>
      </div>
    </div>

    <div class="detail-grid">
      <div class="card inner">
        <h2>Para quién es</h2>
        <p>${app.who || "—"}</p>
      </div>
      <div class="card inner">
        <h2>El problema</h2>
        <p>${app.problem || "—"}</p>
      </div>
      <div class="card inner">
        <h2>Qué consigues</h2>
        <ul>${(app.benefits || []).map(b => `<li>${b}</li>`).join("")}</ul>
      </div>
      <div class="card inner">
        <h2>Características</h2>
        <div class="chips">${feats || "<span class='muted'>—</span>"}</div>
      </div>
    </div>
  `;

  document.title = `${app.name} — Mis Apps`;
}

async function init() {
  setYear();

  const apps = await loadApps();

  renderCatalog(apps);

  const params = new URLSearchParams(location.search);
  const slug = params.get("slug");
  if (slug) {
    const app = apps.find(a => a.slug === slug);
    if (app) renderDetail(app);
    else {
      const box = $("#detail");
      if (box) box.innerHTML = `<div class="card">App no encontrada. <a href="/">Volver</a></div>`;
    }
  }
}

init().catch(err => {
  console.error(err);
  const grid = $("#apps");
  if (grid) grid.innerHTML = `<div class="card"><p>Error cargando el catálogo.</p></div>`;
});
