  // --- SEO dinámico (title/description + OG/Twitter + canonical + JSON-LD) ---
  const clean = (s) => (s || "").toString().replace(/\s+/g, " ").trim();
  const descText = clean(app.problem || app.tagline || `App gratuita: ${app.name}`).slice(0, 155);

  // Meta description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement("meta");
    metaDesc.setAttribute("name", "description");
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute("content", descText);

  // Canonical (con slug)
  const canonicalUrl = `https://luismiquel.github.io/app.html?slug=${encodeURIComponent(app.slug)}`;
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", canonicalUrl);

  // OG/Twitter metas
  const setMeta = (selector, attrName, attrValue, content) => {
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attrName, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  };

  const seoTitle = `${app.name} — Apps gratis | Luis Miquel`;
  setMeta('meta[property="og:title"]', "property", "og:title", seoTitle);
  setMeta('meta[property="og:description"]', "property", "og:description", descText);
  setMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);

  setMeta('meta[name="twitter:title"]', "name", "twitter:title", seoTitle);
  setMeta('meta[name="twitter:description"]', "name", "twitter:description", descText);

  // JSON-LD por app (SoftwareApplication)
  const old = document.getElementById("app-jsonld");
  if (old) old.remove();
  const s = document.createElement("script");
  s.type = "application/ld+json";
  s.id = "app-jsonld";
  s.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": app.name,
    "applicationCategory": app.category || "Application",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
    "url": canonicalUrl,
    "description": descText
  });
  document.head.appendChild(s);
