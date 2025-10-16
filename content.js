(() => {
  const OVERLAY_ID = "cursor-usage-cost-overlay";
  const DEBUG = false;

  function log(...args) {
    if (DEBUG) console.log("[CursorUsageCost]", ...args);
  }

  function isOnUsageTab() {
    try {
      const url = new URL(window.location.href);
      return (
        (url.pathname.includes("/dashboard") || url.pathname === "/") &&
        (url.searchParams.get("tab")?.toLowerCase() === "usage" ||
          document.querySelector('[data-testid="usage-table"], table'))
      );
    } catch {
      return false;
    }
  }

  function extractDollarValueFromText(text) {
    if (!text) return null;
    const match = text.replace(/\s+/g, " ").match(/\$\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)/);
    if (!match) return null;
    const numeric = match[1].replace(/,/g, "");
    const value = parseFloat(numeric);
    return Number.isFinite(value) ? value : null;
  }

  function parseAmountFromElement(el) {
    if (!el) return null;

    // Priority 1: title attribute like "$0.12 value"
    const title = el.getAttribute?.("title");
    const fromTitle = extractDollarValueFromText(title || "");
    if (fromTitle != null) return fromTitle;

    // Priority 2: first span text like "$0.12"
    const firstSpan = el.querySelector?.("span");
    const fromSpan = extractDollarValueFromText(firstSpan?.textContent || "");
    if (fromSpan != null) return fromSpan;

    // Priority 3: element text
    const fromSelf = extractDollarValueFromText(el.textContent || "");
    if (fromSelf != null) return fromSelf;

    return null;
  }

  function findAmountContainers() {
    // Known structure example:
    // <td class="w-[100px] px-3 py-2.5 text-right">
    //   <div class="flex items-center justify-end gap-1 cursor-help" title="$0.12 value">
    //     <span class="text-brand-gray-400 line-through decoration-[0.5px]">$0.12</span>
    //     <span>Included</span>
    //   </div>
    // </td>

    const selectors = [
      'td.text-right div.cursor-help[title*="$"]',
      'td.text-right [title*="$"]',
      'td.text-right span:has(+ span)', // heuristic: price + label
    ];
    const results = new Set();
    selectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => results.add(el));
    });
    return Array.from(results);
  }

  function calculateTotal() {
    const containers = findAmountContainers();
    let total = 0;
    let count = 0;
    containers.forEach((el) => {
      const value = parseAmountFromElement(el);
      if (value != null && Number.isFinite(value)) {
        total += value;
        count += 1;
      }
    });
    return { total, count };
  }

  function findRowForAmountElement(el) {
    return el.closest?.("tr") || null;
  }

  function parseDateFromRow(row) {
    if (!row) return null;
    // Prefer first td with a title attribute (e.g., "Sep 10, 2025, 05:04:24 PM")
    const firstTd = row.querySelector('td[title]') || row.querySelector('td');
    if (!firstTd) return null;

    // Try title attribute
    const title = firstTd.getAttribute?.('title') || '';
    let dt = null;
    if (title) {
      const d = new Date(title);
      if (!isNaN(d.getTime())) dt = d;
    }

    // Fallback: parse text content like "Sep 10, 05:04 PM" (no year). Assume current year.
    if (!dt) {
      const txt = (firstTd.textContent || '').trim();
      if (txt) {
        const assumed = `${txt} ${new Date().getFullYear()}`;
        const d2 = new Date(assumed);
        if (!isNaN(d2.getTime())) dt = d2;
      }
    }

    return dt;
  }

  function calculateDateRange() {
    const containers = findAmountContainers();
    let minDate = null;
    let maxDate = null;
    containers.forEach((el) => {
      const row = findRowForAmountElement(el);
      const dt = parseDateFromRow(row);
      if (dt) {
        if (!minDate || dt < minDate) minDate = dt;
        if (!maxDate || dt > maxDate) maxDate = dt;
      }
    });
    return { from: minDate, to: maxDate };
  }

  function pad2(n) {
    return n < 10 ? `0${n}` : `${n}`;
  }

  function formatDateTime(dt) {
    if (!dt) return '';
    const y = dt.getFullYear();
    const m = pad2(dt.getMonth() + 1);
    const d = pad2(dt.getDate());
    const hh = pad2(dt.getHours());
    const mm = pad2(dt.getMinutes());
    const ss = pad2(dt.getSeconds());
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
  }

  function formatMonthDay(dt) {
    if (!dt) return '';
    try {
      // Always format in English
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
      }).format(dt);
    } catch {
      return `${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
    }
  }

  function daysBetweenInclusive(from, to) {
    if (!from || !to) return 0;
    const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
    const msPerDay = 24 * 60 * 60 * 1000;
    const diff = Math.round((end - start) / msPerDay) + 1;
    return diff > 0 ? diff : 0;
  }

  function formatUSD(value) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      return `$${value.toFixed(2)}`;
    }
  }

  function t(id, ...args) {
    // Force English literals regardless of browser/extension locale
    const fallbacks = {
      overlay_title: 'Total Amount',
      overlay_close_aria: 'Close',
    };
    return fallbacks[id] || id;
  }

  function ensureOverlay() {
    let overlay = document.getElementById(OVERLAY_ID);
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.setAttribute("role", "status");
    overlay.style.position = "fixed";
    overlay.style.top = "12px";
    overlay.style.right = "12px";
    overlay.style.zIndex = "2147483647"; // max
    overlay.style.background = "#111827"; // gray-900
    overlay.style.color = "#F9FAFB"; // gray-50
    overlay.style.border = "1px solid #2563EB"; // blue-600
    overlay.style.borderRadius = "10px";
    overlay.style.padding = "10px 12px";
    overlay.style.boxShadow = "0 10px 25px rgba(0,0,0,0.35)";
    overlay.style.fontFamily = "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
    overlay.style.fontSize = "14px";
    overlay.style.lineHeight = "1.2";
    overlay.style.cursor = "default";
    overlay.style.userSelect = "none";

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "×";
    closeBtn.setAttribute("aria-label", t('overlay_close_aria'));
    closeBtn.style.marginLeft = "10px";
    closeBtn.style.background = "transparent";
    closeBtn.style.color = "#9CA3AF"; // gray-400
    closeBtn.style.border = "none";
    closeBtn.style.fontSize = "16px";
    closeBtn.style.cursor = "pointer";
    closeBtn.addEventListener("mouseenter", () => (closeBtn.style.color = "#F9FAFB"));
    closeBtn.addEventListener("mouseleave", () => (closeBtn.style.color = "#9CA3AF"));

    const title = document.createElement("strong");
    title.textContent = t('overlay_title');
    title.style.fontWeight = "600";
    title.style.marginRight = "8px";

    const valueEl = document.createElement("span");
    valueEl.dataset.role = "value";

    const detailsEl = document.createElement("span");
    detailsEl.dataset.role = "details";
    detailsEl.style.marginLeft = "8px";
    detailsEl.style.color = "#9CA3AF";

    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";

    row.appendChild(title);
    row.appendChild(valueEl);
    row.appendChild(detailsEl);
    row.appendChild(closeBtn);

    const rangeRow = document.createElement("div");
    rangeRow.style.marginTop = "6px";
    rangeRow.style.fontSize = "12px";
    rangeRow.style.color = "#9CA3AF"; // gray-400

    const rangeEl = document.createElement("span");
    rangeEl.dataset.role = "range";
    rangeRow.appendChild(rangeEl);

    overlay.appendChild(row);
    overlay.appendChild(rangeRow);

    closeBtn.addEventListener("click", () => {
      overlay.remove();
    });

    // Drag to move
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startRight = 0;
    let startTop = 0;
    overlay.addEventListener("mousedown", (e) => {
      if ((e.target || e.srcElement) === closeBtn) return; // allow close
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startRight = parseInt(window.getComputedStyle(overlay).right || "12", 10);
      startTop = parseInt(window.getComputedStyle(overlay).top || "12", 10);
      overlay.style.transition = "none";
      document.body.style.userSelect = "none";
    });
    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      overlay.style.right = `${Math.max(4, startRight - dx)}px`;
      overlay.style.top = `${Math.max(4, startTop + dy)}px`;
    });
    window.addEventListener("mouseup", () => {
      if (!isDragging) return;
      isDragging = false;
      overlay.style.transition = "";
      document.body.style.userSelect = "";
    });

    document.documentElement.appendChild(overlay);
    return overlay;
  }

  function updateOverlay() {
    const overlay = ensureOverlay();
    const { total, count } = calculateTotal();
    const { from, to } = calculateDateRange();
    const valueEl = overlay.querySelector('[data-role="value"]');
    const detailsEl = overlay.querySelector('[data-role="details"]');
    const rangeEl = overlay.querySelector('[data-role="range"]');
    if (valueEl) valueEl.textContent = formatUSD(total);
    if (detailsEl) detailsEl.textContent = `(${count} ${count === 1 ? 'item' : 'items'})`;
    if (rangeEl) {
      if (from && to) {
        const fromStr = formatMonthDay(from);
        const toStr = formatMonthDay(to);
        const days = daysBetweenInclusive(from, to);
        const daysText = ` (last ${days} ${days === 1 ? 'day' : 'days'})`;
        rangeEl.textContent = `From ${fromStr} to ${toStr}${daysText}`;
      } else {
        rangeEl.textContent = "";
      }
    }

    // Only show on usage context; hide otherwise but keep available
    overlay.style.display = isOnUsageTab() ? "block" : "none";
  }

  function debounce(fn, wait) {
    let t = null;
    return (...args) => {
      if (t) clearTimeout(t);
      t = setTimeout(() => fn.apply(null, args), wait);
    };
  }

  function observeDom() {
    const debounced = debounce(updateOverlay, 400);
    const mo = new MutationObserver(() => debounced());
    mo.observe(document.documentElement || document.body, {
      subtree: true,
      childList: true,
      characterData: false,
      attributes: false,
    });
  }

  function hookHistory() {
    const fire = debounce(updateOverlay, 0);
    const wrap = (type) => {
      const orig = history[type];
      return function () {
        const ret = orig.apply(this, arguments);
        fire();
        return ret;
      };
    };
    history.pushState = wrap("pushState");
    history.replaceState = wrap("replaceState");
    window.addEventListener("popstate", fire);
  }

  function init() {
    try {
      ensureOverlay();
      updateOverlay();
      observeDom();
      hookHistory();
      window.addEventListener("load", updateOverlay);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") updateOverlay();
      });
      log("initialized");
    } catch (e) {
      console.error("[CursorUsageCost] init error", e);
    }
  }

  init();
})();


