# CLAUDE.md

Guidance for Claude Code when working in this repository. See `README.md` for what the product does and the current status.

## Project shape

- **Website = `index.html` at the repo root.** One file holds the HTML, CSS and JavaScript. There is no build step, bundler or package.json. GitHub Pages serves it from `main`, at https://raushanraj358.github.io/aayush-computers/.
- `web/index.html` only forwards to `../`. Don't add features there.
- `privacy.html` and `terms.html` are static pages, each with its own copy of the footer.
- `googledc2282506e76168c.html` is Google's site verification file. Never edit, rename or delete it.
- **Database files:** `backend/supabase/` holds SQL that the user runs by hand in the Supabase SQL Editor, in this order: `schema.sql`, `002_app_access.sql`, `003_product_photos.sql`. All three have been run on the live project.
  - Any new database change goes in a new numbered file (`004_...sql`).
  - Make it safe to run twice (`if not exists`, `drop policy if exists`, `on conflict`).
  - Then tell the user to run it.
- **Mobile app:** `mobile/` is a partial React Native (Expo) app: `src/lib/auth.ts`, `googleAuth.ts`, `supabase.ts`, `hooks/useSession.ts` and `screens/LoginScreen.tsx`.
  - It has no package.json or app.json yet, so it can't be built or type-checked here.
  - When login behaviour changes on the website, make the same change in `LoginScreen.tsx` and `auth.ts`.

## How index.html is organised

### Basics
- **Supabase client:** supabase-js v2.49.4 from jsDelivr, pinned to that version. `SB_URL` and `SB_KEY` hold the project URL and publishable key; both are public. `sb` is null if the library fails to load.
- **State and rendering:** one state object `S`. `render()` rebuilds `#app` from template strings and appends `FOOT` (the copyright line).
  - `render()` keeps typed input values and focus when the screen key hasn't changed. The key is user, boot, recovery, mode, view, `S.ep`, `S.op` and `S.rd`.
  - `S.fresh=true` forces the next render to clear the form.
  - A chosen product photo lives in `S.photo` so a re-render doesn't lose it.
  - `render()` also puts the unread count in the tab title.
  - Always pass user data through `esc()` before putting it into HTML.
- **Events:** clicks go through one delegated handler that reads `data-a` (the action) and `data-v` / `data-id`.
  - To add a button, give it a `data-a` and add a branch to that handler; don't attach new listeners.
  - Wrap async database actions in `run()`, which stops double clicks.
  - A button inside a clickable card (for example "Mark as" inside `.rq`) works because `closest("[data-a]")` finds the button first.
- **Views:**
  - Customer, via `customer()`: home, shop, reqs, newreq, order, notes, profile, rdet.
  - Owner, via `owner()`: orq (Requests), prod, pedit, notes, profile, rdet.

### Login
- `login()` and `LT` hold the screens; `authAct` and `authRun` run the actions. Modes: signin, signup, verify, forgot, reset, newpw.
- Email accounts get a **link**, not a code. Supabase's default templates send `{{ .ConfirmationURL }}`, so verify/reset for an email shows a "Check your email" screen with no code box.
- Phone accounts use SMS codes.
- The `PASSWORD_RECOVERY` event (from a reset link) switches to `newpw`.

### Data
- `loadData()` loads products, requests (with `status_history(status,changed_at,note)` and `profiles`) and notifications (`id,request_id,message,read,created_at`).
- `mapReq` turns a request row into `{id,type,title,detail,device,uid,phone,name,s,hist,hnote}`: `s` is the step index, and `hist` / `hnote` hold each step's date and note. `mapProd` does the same for products.
- `listen()` subscribes in realtime to new notifications for the user and calls `loadData()`.
- Database errors go through `dbMsg()`, which gives friendly text.
- **Statuses:** `FLOW[type]` lists the steps for each type (service, order, enquiry), and `isDone(r)` is true at the last step. The database checks status values too.

### Requests and tracking
- `reqCard(r, isOwner)` is the compact list card: current status, date and progress bar. The owner's card also has a quick "Mark as" button.
- Tapping a card calls `openReq(id)`, which opens `reqDetail()` (view `rdet`, request `S.rd`).
  - `reqDetail()` shows the full step tracker, `tracker(r)`: done / current / pending steps, each step's date and the shop's note.
  - Opening pushes a history entry, so the phone's Back button (`popstate`) and the "All requests" link both call `closeReq()`.
- **Owner note:** on the tracker page the owner can type a note (`#onote`). `adv` sends it as `owner_note` together with the new status.
  - Database triggers then write it to `status_history.note` and add it to the customer's notification.
  - The quick button on list cards sends no note.
- **Owner filters:** `OF` holds the filters open, repair, new and done; `S.of` is the selected one.

### Notifications
Call them "notifications" in the UI, never "alerts".
- **Bell:** `bellBtn()` shows the unread badge (shown as 9+ above nine) and rings when one arrives.
- **Page:** `notesView()` has filter chips (`S.nf`), and Today / Yesterday / Earlier groups. `noteGroups()` merges all notifications for one request into a single entry.
- **Text:** `noteInfo()` works out the title, type and icon from the message text, because the database stores plain text. `ago()` gives relative times.
- **Banner:** `popUp()` shows the top banner when `loadData()` finds unread notifications it hasn't seen before.
  - It doesn't show on the first load.
  - It doesn't show within 8 seconds of the user's own request (`S.quiet`).
  - It doesn't show while the Notifications page is open.
- **Opening one:** `openNote()` marks every notification of that request read, then calls `openReq()`.
- **Read flag:** wait for the read update to save before calling `loadData()`, or the badge comes back. Opening the page saves through `S.mr`.

### Auto-update
`checkUpdate()` sends a `HEAD` request for the page with `cache:"no-store"` and compares its `Last-Modified` with `document.lastModified` (`BUILT`).
- **When it runs:** 4 seconds after load, on focus or when the page becomes visible, and every 5 minutes.
- **If the live copy is newer:** `doUpdate()` reloads at `HERE?v=<time>`, a new address that skips the saved copy. The time is stored in sessionStorage (`acUpd`) so it reloads at most once per version.
- **If the user is busy** (typing, a photo chosen, or a save in progress): it shows the `#upd` "Update now" bar instead.
- **Only on https.** It does nothing when the file is opened locally, so tests must remove that check.
- **No version number to change:** every push changes `Last-Modified` by itself.

### Owner products
`prodAdmin`, `prodEdit` and `prodFields` hold the screens. Photos are shrunk to 1200px JPEG in the browser (`shrink`), then uploaded to the public `product-photos` bucket.

### Design
- Colours are CSS variables in `:root`, with dark-mode overrides.
- Buttons: `.b`, `.b.o` (outline), `.b.g` (green), `.b.sm`, plus `.lnk`, `.chip` and `.stat`. All of them turn blue while pressed.
- Other pieces:
  - request cards: `.rq`, `.pbar`;
  - tracker: `.trk`;
  - notifications: `.nt`, `.nlist`, `.ngrp`;
  - banner: `.pop`.
- **Headers:**
  - Only the customer home page has the full brand header: logo, "AAYUSH COMPUTERS", tagline and search.
  - Every other page uses `bar(title, back, logo)`. It draws a slim sticky top bar (`.tb`) with the page title, an optional back arrow (`back` holds that button's `data-` attributes), and the bell and profile buttons.
  - Only the owner's Requests page passes `logo`.
  - Don't add "Aayush Computers" to inner pages.
- **Hiding elements:** `[hidden]{display:none!important}` is there on purpose, so `el.hidden` works even on elements styled with `display:flex` or `display:grid`, such as `#upd` and `#pop`. Use `hidden` to show and hide things.
- Keep the layout working at 480px wide and below.
- Don't put sample phone numbers or emails in input placeholders; the user had them removed.

## Roles and security

- `profiles.role` is either `customer` or `owner`. The owner is set by hand in SQL (see `backend/README.md`).
- Row level security plus `public.is_owner()` enforce what each person can do. The UI hiding something is not the protection.
- New Supabase projects give app users no table access by default. A new table needs grants (as in `002_app_access.sql`) as well as policies. On `requests`, signed-in users can update only `status` and `owner_note`, and RLS limits that to the owner.
- **Never ask for, handle or commit the Supabase secret key.** Only the publishable key belongs in code. `mobile/.env` is local only and ignored by git.
- Don't put the user's personal email into code, commits or requests to outside services.

## Testing (no Node here)

This machine has no node, npm or brew.
- **Syntax check:** copy the last `<script>` of `index.html` into a file wrapped in `function f(){...}`, then run it with `/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc`.
- **Behaviour:** copy `index.html` into the scratchpad and replace the supabase-js `<script>` tag with a stand-in `window.supabase`. The stand-in needs:
  - `auth.onAuthStateChange` that signs in a test user;
  - `from()` returning a chainable query builder, with `update().eq().select()`;
  - `channel()` that saves the realtime callback, so a test can fake a live notification.

  Serve the folder with a tiny Python server that also logs `GET /log?msg`. Add a script that clicks through the flow and reports to `/log`, then run headless Chrome (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --headless=new --remote-debugging-port=...`).
- **Screenshots:** `--screenshot` with `--virtual-time-budget=3000` works when the stand-in is used. Against the real network it stalls on "Loading…".
- Headless Chrome's smallest window is 500px wide. Check narrow layouts by measuring for overflow, not by eye.

## Workflow

- Wording: say "Aayush Computers" (with "AAYUSH COMPUTERS" in the header). Use plain, friendly text. Never claim an SMS, email or notification was sent unless it really was.
- Commit when the user asks, and keep `README.md` and this file up to date when features change. `git push` doesn't work from this session (no credentials), so the user pushes with `! git push origin main`.
- After a push, the site updates itself: open pages reload within about 5 minutes, or as soon as the page is reopened or brought back to the screen. To see a change at once, the user can still open the site with a new `?v=<n>` added to the address. The last one used was `?v=13`.
- If the user says a change "isn't showing", first check the live site with `curl` (add a random query string). Usually it's the phone's saved copy, not the code.
