## Cursor Usage Cost Overlay (MV3 Extension)

Sum up all USD amounts on the Cursor Usage page and display a draggable overlay that updates automatically as the table changes.

Target page: `https://cursor.com/cn/dashboard?tab=usage` (Cursor Usage)

### Features
- Scan page for amount elements (prefer dollar values in `title` attributes like "$0.12 value", fallback to text parsing)
- Show a prominent overlay at top-right (draggable, closable)
- Watch DOM and history changes: auto-refresh after paging/filtering

### Install (Chrome/Brave/Edge)
1. Open `chrome://extensions/` (Edge: `edge://extensions/`).
2. Enable Developer mode (top-right).
3. Click “Load unpacked”.
4. Select the project directory: `/Users/xiaohaoxing/repos/cursor-value-calculator`.
5. Visit `https://cursor.com/cn/dashboard?tab=usage`; the overlay will appear with the total.

> The flow is similar for other Chromium-based browsers.

### Usage
- The overlay shows: total amount (USD) and number of parsed amount items on the page.
- Interactions:
  - Drag to move: hold anywhere on the overlay (except the close button) and drag.
  - Close: click the “×”. Refresh or navigate again to show it back.

### How it works
- Manifest V3 content script extension:
  - `manifest.json` injects `content.js` on `https://cursor.com/*` and `https://www.cursor.com/*`.
  - `content.js`:
    - Locates amount containers via selectors (e.g. `td.text-right div.cursor-help[title*="$"]`).
    - Parses USD from `title` or text and sums them up, then displays the result.
    - Uses `MutationObserver` and hooks `history.pushState/replaceState/popstate` to auto-refresh.

### Troubleshooting
- No overlay:
  - Ensure you are on `https://cursor.com/cn/dashboard?tab=usage`.
  - Refresh the page and ensure the extension is enabled.
  - Open DevTools Console to check errors.
- Total mismatch:
  - Parsing prefers dollar values in `title`; adjust selectors or parsing in `content.js` if the DOM changes.

### Privacy
- All logic runs locally in your browser. No data is sent to any server.

### Reference
- Target page: [https://cursor.com/cn/dashboard?tab=usage](https://cursor.com/cn/dashboard?tab=usage)

---

### Publish to Chrome Web Store

1. Prepare assets & files
   - Icons: `icons/icon16.png`, `icons/icon48.png`, `icons/icon128.png` (PNG)
   - Privacy Policy: `PRIVACY.md` (or a website URL)
   - Store listing copy: `store/STORE_LISTING.en.md`
2. Build release ZIP
   - Run: `./scripts/pack.sh`
   - Output: `dist/cursor-usage-cost-overlay.zip`
3. Register & sign in to Developer Dashboard
   - Visit: `https://chrome.google.com/webstore/developer/dashboard`
   - Pay one-time fee and complete verification
4. Create a new item and upload
   - Upload the ZIP
   - Fill in name, short description, full description, category, languages
   - Upload 128×128 icon and at least 1 screenshot (e.g. 1280×800)
5. Visibility & submit
   - Start with Unlisted/Private for testing, then switch to Public
   - Ensure permissions are limited to `cursor.com`
   - Submit for review

Notes:
- Bump `manifest.json` `version` before each release, then repackage.
- Screenshot/promo sizes depend on the dashboard’s latest guidance.
