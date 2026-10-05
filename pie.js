(function (exports) {
  "use strict";

  const MIN_RADIUS = 8;
  const MAX_RADIUS = 30;

  function pieSlices(values) {
    const total = values.reduce((sum, v) => sum + (v > 0 ? v : 0), 0);
    if (!total) return [];
    const slices = [];
    let start = 0;
    values.forEach((v, index) => {
      if (!(v > 0)) return;
      const end = start + v / total;
      slices.push({ index, start, end });
      start = end;
    });
    return slices;
  }

  function point(fraction, r) {
    const angle = 2 * Math.PI * fraction - Math.PI / 2;
    return [r + r * Math.cos(angle), r + r * Math.sin(angle)].map((n) => n.toFixed(2));
  }

  function pieSvg(values, colors, r) {
    const slices = pieSlices(values);
    const size = 2 * r;
    const parts = slices.map(({ index, start, end }) => {
      if (end - start >= 0.9999) {
        return `<circle cx="${r}" cy="${r}" r="${r}" fill="${colors[index]}"/>`;
      }
      const [x1, y1] = point(start, r);
      const [x2, y2] = point(end, r);
      const largeArc = end - start > 0.5 ? 1 : 0;
      return `<path d="M${r},${r} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z" fill="${colors[index]}"/>`;
    });
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
      parts.join("") +
      `<circle cx="${r}" cy="${r}" r="${r - 0.5}" fill="none" stroke="#333" stroke-width="1"/></svg>`
    );
  }

  function pieRadius(total, maxTotal) {
    if (!maxTotal || !(total > 0)) return MIN_RADIUS;
    return MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * Math.sqrt(total / maxTotal);
  }

  exports.pieSlices = pieSlices;
  exports.pieSvg = pieSvg;
  exports.pieRadius = pieRadius;
  exports.MIN_RADIUS = MIN_RADIUS;
  exports.MAX_RADIUS = MAX_RADIUS;
})(typeof module !== "undefined" ? module.exports : (window.Pie = {}));
