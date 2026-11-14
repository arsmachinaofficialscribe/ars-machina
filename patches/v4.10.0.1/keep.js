/* Build: the field the player is typing in survives a redraw (a rebuilt field was refocused with its caret at the
   start, so "2" then "5" became "52" in fields that redraw their section, such as Years since Gauntlet). */
function typingIn(host) {
  const a = document.activeElement;
  if (!a || !host || !host.contains(a) || !/^(INPUT|TEXTAREA)$/.test(a.tagName)) return null;
  if (/^(checkbox|radio|button|submit|reset|range|file|color|image|hidden)$/.test(a.type)) return null;
  return a.dataset.k || a.id ? a : null;
}
function putBackField(host, a, sid) {
  const scope = (sid && document.getElementById(sid)) || host;
  const q = a.dataset.k ? '[data-k="' + CSS.escape(a.dataset.k) + '"]' : "#" + CSS.escape(a.id);
  const n = [].find.call(scope.querySelectorAll(q), function (x) {
    return x.tagName === a.tagName ? x.type === a.type : a.tagName === "TEXTAREA" && x.tagName === "INPUT" && x.type === "text";
  });
  if (!n) return;
  [].slice.call(n.attributes).forEach(function (x) {
    x.name !== "value" && x.name !== "type" && a.getAttribute(x.name) !== x.value && a.setAttribute(x.name, x.value);
  });
  const v = n.tagName === "TEXTAREA" ? n.value : n.getAttribute("value") || "";
  n.replaceWith(a);
  if (String(a.value) !== String(v) && !(a.type === "number" && v !== "" && Number(a.value) === Number(v))) a.value = v;
  a.focus({ preventScroll: true });
}
{ const WS = window.amWorkSet; if (WS) window.amWorkSet = function (parts) {
  const w = document.getElementById("work"), a = typingIn(w), sec = a && a.closest("section.folio"), sid = sec && sec.id;
  const r = WS.apply(this, arguments);
  try { a && !a.isConnected && putBackField(w, a, sid); } catch (z) { console.error(z); }
  return r;
}; }
