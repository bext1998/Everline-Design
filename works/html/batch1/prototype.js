// Everline batch 1 pilot — indeterminate is a JS-only DOM property, not an HTML attribute,
// so it cannot be set by a checked/indeterminate attribute in index.html.
document.querySelectorAll('[data-indeterminate]').forEach((el) => {
  el.indeterminate = true;
});
