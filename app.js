(function () {
  "use strict";

  const data = window.RIGA_DATA;
  const elections = data.elections;
  const colors = elections.map((e) => e.color);
  const fmt = (n) => (n == null ? "–" : n.toLocaleString("lv-LV"));
  const fmtPct = (p) => (p == null ? "–" : p.toFixed(2).replace(".", ",") + "%");
  const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const map = L.map("map").setView([56.95, 24.11], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Dati: CVK',
  }).addTo(map);

  const totalVotes = (loc) => elections.reduce((sum, e) => sum + (loc.results[e.code] ? loc.results[e.code].votes : 0), 0);
  const maxTotal = Math.max(...data.locations.map(totalVotes));

  function popupHtml(loc) {
    const rows = elections.map((e) => {
      const r = loc.results[e.code];
      const label = `<span class="swatch" style="background:${e.color}"></span>${escapeHtml(e.code)}`;
      if (!r) return `<tr><td>${label}</td><td colspan="3">nav iecirkņa</td></tr>`;
      const stations = r.stations.map((s) => `#${s.number} ${escapeHtml(s.name)}`).join("<br>");
      return `<tr><td>${label}<div class="stations">${stations}</div></td>` +
        `<td class="num"><b>${fmt(r.votes)}</b></td><td class="num"><b>${fmtPct(r.pct)}</b></td>` +
        `<td class="num">${fmt(r.valid_envelopes)}</td></tr>`;
    });
    return `<div class="popup"><h3>${escapeHtml(loc.address)}</h3>` +
      `<table><tr><th>Vēlēšanas</th><th>Balsis</th><th>%</th><th>Derīgās aploksnes</th></tr>${rows.join("")}</table></div>`;
  }

  const layer = L.layerGroup().addTo(map);

  function render(mode) {
    layer.clearLayers();
    data.locations.forEach((loc) => {
      const values = elections.map((e) => {
        const r = loc.results[e.code];
        return r ? (mode === "pct" ? r.pct : r.votes) : 0;
      });
      const r = Pie.pieRadius(totalVotes(loc), maxTotal);
      const icon = L.divIcon({ className: "pie-icon", html: Pie.pieSvg(values, colors, r), iconSize: [2 * r, 2 * r] });
      L.marker([loc.lat, loc.lon], { icon }).bindPopup(popupHtml(loc), { maxWidth: 420 }).addTo(layer);
    });
  }

  const legend = L.control({ position: "bottomright" });
  legend.onAdd = () => {
    const div = L.DomUtil.create("div", "legend");
    div.innerHTML = "<b>Progresīvie Rīgā</b><br>" + elections.map((e) =>
      `<span class="swatch" style="background:${e.color}"></span>${escapeHtml(e.title)}: ` +
      `<b>${fmt(e.total.votes)}</b> (${fmtPct(e.total.pct)})`).join("<br>");
    return div;
  };
  legend.addTo(map);

  document.querySelectorAll('input[name="mode"]').forEach((input) =>
    input.addEventListener("change", (ev) => render(ev.target.value)));
  render("votes");

  document.getElementById("special").innerHTML =
    "<tr><th>Vēlēšanas</th><th>Nr.</th><th>Komisija</th><th>Adrese</th><th>Balsis</th><th>%</th></tr>" +
    data.special.map((s) => `<tr><td>${s.election}</td><td>${s.number}</td><td>${escapeHtml(s.name)}</td>` +
      `<td>${escapeHtml(s.address)}</td><td class="num">${fmt(s.votes)}</td><td class="num">${fmtPct(s.pct)}</td></tr>`).join("");

  if (data.unlocated.length) {
    document.getElementById("unlocated").innerHTML = "<h2>Iecirkņi bez koordinātām</h2><ul>" +
      data.unlocated.map((s) => `<li>${s.election} #${s.number} ${escapeHtml(s.name)} – ${escapeHtml(s.address)}</li>`).join("") + "</ul>";
  }
})();
