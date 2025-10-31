# Chrome Web Store Listing Checklist & Copy (EN)

Replace TODO fields with your actual info.

## Basic Info
- Name
  - Suggested: Cursor Usage Cost Overlay
  - Short name: Cursor Cost (keep concise)
- Short description (≤132 chars)
  - Template: Sum USD amounts on Cursor Usage page and show a live overlay.
- Full description
  - Template:
    - Automatically extracts USD amounts (from `$` in `title` or text) and sums them;
    - Displays a draggable, closable overlay at the top-right;
    - Watches DOM and route changes to auto-refresh after pagination/filtering;
    - Runs locally in your browser, collects no user data.

## Category & Languages
- Category: Productivity (or appropriate)
- Languages: English (en), Chinese Simplified (zh-CN), etc.

## Permissions & Visibility
- Permissions: content scripts for `https://cursor.com/*` and `https://www.cursor.com/*` only.
- Visibility: Public (you may start with Unlisted/Private for testing).

## Assets (upload in dashboard)
- Icon: 128×128 PNG (same as `icons/icon128.png`).
- Screenshots: at least 1 (e.g., 1280×800) showing the overlay on the Usage page.
- Optional promo assets: follow dashboard prompts (sizes may vary).

## Privacy & Contact
- Privacy Policy URL: link to `PRIVACY.en.md` (or a website page).
- Support contact: GitHub Issues or email: TODO add contact email.

## Version & Notes
- Version (manifest `version`): 0.2.0 (increment per release).
- Release notes: list key changes.

---

## Example Copy

- Short description:
  - Sum USD amounts on Cursor Usage page and show a live overlay.

- Full description:
  - Cursor Usage Cost Overlay automatically aggregates all USD amounts displayed on Cursor’s Usage page and shows a clear overlay at the top-right. It:
    - Parses dollar amounts from `title` or text and sums them up;
    - Provides a draggable, closable overlay;
    - Monitors DOM/history changes to refresh after pagination/filtering;
    - Runs entirely in your browser and collects no user data.

- Permissions:
  - Works only on `https://cursor.com/*` and `https://www.cursor.com/*`. No extra sensitive permissions.

- Support:
  - Use the extension page or GitHub repository to report issues and suggestions.
