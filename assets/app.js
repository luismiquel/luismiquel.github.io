/* Catálogo + Detalle + SEO dinámico
   - Lee /assets/apps.json
   - Renderiza catálogo si existe #apps
   - Renderiza detalle si existe #app-detail y slug en URL
*/

const APPS_URL = "/assets/apps.json";

function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }
function esc(s="") { return String(s).replace(/[&<>"']/g, (c)=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])); }

function getParam(name) {
  const u = new URL(window.location.href);
  return u.searchParams.get(name);
}

function setDetailSeo(app) {
  // Solo si estamos en app.html (si no existen ids, no hace nada)
  const title = `${app.name} (Gratis) | Luis Miquel`;
  const descBase = `${app.tagline} ${app.problem || ""}`.trim();
  const desc = descBase.length > 155 ? descBase.slice(0, 152) + "..." : descBase;

  const url = `https://luismiquel.github.io/app.html?slug=${encodeURIComponent(app.slug)}`;

  const byId = (id) => document.getElementById(id);

  document.title = title;

  const seoDesc = byId("seo-desc");
  if (seoDesc) seoDesc.setAttribute("content", desc);

  const canon = byId("seo-canonical");
  if (canon) canon.setAttribute("href", url);

  const ogTitle = byId("og-title");
  if (ogTitle) ogTitle.setAttribute("content", title);

  const ogDesc = byId("og-desc");
  if (ogDesc) ogDesc.setAttribute("content", desc);

  const ogUrl = byId("og-url");
  if (ogUrl) ogUrl.setAttribute("content", url);

  const twTitle = byId("tw-title");
  if (twTitle) twTitle.setAttribute("content", title);

  const twDesc = byId("tw-desc");
  if (twDesc) twDesc.setAttribute("content", desc);

  const ld = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": app.name,
    "applicationCategory": app.category || "WebApplication",
    "operatingSystem": "Web",
    "description": desc,
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
    "url": app.demoUrl || url
  };
  const ldEl = byId("ldjson-app");
  if (ldEl) ldEl.textContent = JSON.stringify(ld);
}

function normalizeApps(raw) {
  const arr = Array.isArray(raw) ? raw : [];
  return arr
    .filter(a => a && a.status !== "hidden")
    .map(a => ({
      slug: a.slug || "",
      name: a.name || "App",
      tagline: a.tagline || "",
      category: a.category || "General",
      who: a.who || "",
      problem: a.problem || "",
      benefits: Array.isArray(a.benefits) ? a.benefits : [],
      priceText: a.priceText || "Gratis",
      demoUrl: a.demoUrl || "",
      buyUrl: a.buyUrl || "",
      features: Array.isArray(a.features) ? a.features : [],
      status: a.status || "available"
    }))
    .filter(a => a.slug && a.status === "available");
}

function fillSelectOptions(select, apps) {
  if (!select) return;
  const cats = Array.from(new Set(apps.map(a => a.category))).sort((a,b)=>a.localeCompare(b));
  // Mantiene "Todas"
  cats.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });
}

function cardHtml(app) {
  const demo = app.demoUrl ? `<a class="btn primary" href="${esc(app.demoUrl)}" target="_blank" rel="noopener">Demo</a>` : "";
  const detail = `<a class="btn" href="/app.html?slug=${encodeURIComponent(app.slug)}">Detalles</a>`;
  return `
    <article class="card">
      <h3>${esc(app.name)}</h3>
      <p class="sub">${esc(app.tagline)}</p>
      <div class="muted" style="margin:.5rem 0;">${esc(app.category)} · ${esc(app.priceText)}</div>
      <div class="hero-cta">${demo}${detail}</div>
    </article>
  `;
}

function renderCatalog(apps) {
  const grid = document.getElementById("apps");
  if (!grid) return;

  const search = document.getElementById("search");
  const filter = document.getElementById("filter");

  fillSelectOptions(filter, apps);

  function apply() {
    const q = (search?.value || "").trim().toLowerCase();
    const cat = (filter?.value || "all");

    let list = apps.slice();
    if (cat !== "all") list = list.filter(a => a.category === cat);
    if (q) {
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.tagline.toLowerCase().includes(q) ||
        (a.problem || "").toLowerCase().includes(q) ||
        (a.who || "").toLowerCase().includes(q)
      );
    }

    grid.innerHTML = list.map(cardHtml).join("") || `<div class="card"><p class="sub">No hay resultados.</p></div>`;
  }

  search?.addEventListener("input", apply);
  filter?.addEventListener("change", apply);

  apply();
}

function renderDetail(apps) {
  const detail = document.getElementById("app-detail");
  if (!detail) return;

  const slug = getParam("slug");
  if (!slug) {
    detail.innerHTML = `
      <h1>Falta el slug</h1>
      <p class="sub">Vuelve al catálogo y entra desde “Detalles”.</p>
      <a class="btn" href="/">Volver</a>
    `;
    return;
  }

  const app = apps.find(a => a.slug === slug);
  if (!app) {
    detail.innerHTML = `
      <h1>No encontrada</h1>
      <p class="sub">Esta app no existe o está oculta.</p>
      <a class="btn" href="/">Volver</a>
    `;
    return;
  }

  // SEO dinámico
  setDetailSeo(app);

  // Pintar datos
  const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text || ""; };
  setText("app-name", app.name);
  setText("app-tagline", app.tagline);
  setText("app-who", app.who);
  setText("app-problem", app.problem);
  setText("app-price", app.priceText || "Gratis");

  const btnDemo = document.getElementById("btn-demo");
  if (btnDemo) {
    if (app.demoUrl) {
      btnDemo.setAttribute("href", app.demoUrl);
      btnDemo.removeAttribute("aria-disabled");
      btnDemo.style.opacity = "1";
      btnDemo.style.pointerEvents = "auto";
    } else {
      btnDemo.setAttribute("href", "#");
      btnDemo.setAttribute("aria-disabled", "true");
      btnDemo.style.opacity = ".5";
      btnDemo.style.pointerEvents = "none";
      btnDemo.textContent = "Demo no disponible";
    }
  }

  const benefits = document.getElementById("app-benefits");
  if (benefits) benefits.innerHTML = (app.benefits || []).map(b => `<li>${esc(b)}</li>`).join("") || "<li>—</li>";

  const features = document.getElementById("app-features");
  if (features) features.innerHTML = (app.features || []).map(f => `<li>${esc(f)}</li>`).join("") || "<li>—</li>";
}

async function main() {
  try {
    const res = await fetch(APPS_URL, { cache: "no-store" });
    const raw = await res.json();
    const apps = normalizeApps(raw);

    // Catálogo (index)
    renderCatalog(apps);

    // Detalle (app.html)
    renderDetail(apps);

  } catch (e) {
    const grid = document.getElementById("apps");
    if (grid) grid.innerHTML = `<div class="card"><p class="sub">Error cargando apps.json</p></div>`;

    const detail = document.getElementById("app-detail");
    if (detail) detail.innerHTML = `<h1>Error</h1><p class="sub">No se ha podido cargar el detalle.</p><a class="btn" href="/">Volver</a>`;
  }
}

main();
