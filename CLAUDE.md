# CLAUDE.md

Guidance for Claude Code when working in this repository. See `README.md` for what the product does.

## Project shape

- **Website = `index.html` at the repo root.** One file holds the HTML, CSS and JavaScript. There is no build step, bundler or package.json. GitHub Pages serves it from `main`, at https://raushanraj358.github.io/aayush-computers/.
- `web/index.html` only forwards to `../`. Don't add features there.
- `backend/supabase/` has SQL files that are run by hand in the Supabase SQL Editor, in this order: `schema.sql`, then `002_app_access.sql`, then `003_product_photos.sql`. Any new database change goes in a new numbered file (`004_...sql`). Make it safe to run twice (`if not exists`, `drop policy if exists`, `on conflict`), then tell the user to run it.
- `mobile/` is a partial React Native (Expo) app: `src/lib/auth.ts`, `googleAuth.ts`, `supabase.ts`, `hooks/useSession.ts` and `screens/LoginScreen.tsx`. There is no package.json or app.json yet, so it can't be built or type-checked here. When login behaviour changes on the website, make the same change in `LoginScreen.tsx` and `auth.ts`.
- `googledc2282506e76168c.html` is Google's site verification file. Never edit, rename or delete it.

## How index.html is organised

- **Supabase client:** supabase-js v2.49.4 from jsDelivr, pinned to that version. `SB_URL` and `SB_KEY` hold the project URL and publishable key; both are public. `sb` is null if the library fails to load.
- **State and rendering:** one state object `S`, and `render()` rebuilds `#app` from template strings.
  - `render()` keeps typed input values and focus when the screen key hasn't changed. `S.fresh=true` forces the form to clear.
  - A chosen photo lives in `S.photo` so a re-render doesn't lose it.
  - Always pass user data through `esc()` before putting it into HTML.
- **Event handling:** clicks go through one delegated handler that reads `data-a` (the action) and `data-v` / `data-id`. To add a button, give it a `data-a` and add a branch to that handler; don't attach new listeners. Wrap async database actions in `run()`, which stops double clicks.
- **Login screens:** `login()` and `LT` hold the screens; `authAct` and `authRun` run the actions.
  - Modes: signin, signup, verify, forgot, reset, newpw.
  - Email accounts get a link, not a code, so verify/reset for an email shows a "Check your email" screen.
  - Phone accounts use SMS codes.
  - The `PASSWORD_RECOVERY` event switches to the `newpw` mode.
- **Notifications:** call them "notifications" in the UI, never "alerts". The pieces:
  - `notesView()` is the page: filter chips, plus Today / Yesterday / Earlier groups.
  - `noteInfo()` works out a title, type and icon from the message text.
  - `popUp()` shows the top banner when `loadData()` finds unread notifications it hasn't seen before. It doesn't show on first load or within 8 seconds of the user's own request (`S.quiet`).
  - `openNote()` marks a notification read and jumps to its request card (`#rq<id>`).
  - Wait for the "read" update to save before calling `loadData()`, or the badge comes back.
- **Data:** `loadData()` loads products, requests (with status_history and profiles) and notifications. `mapReq` and `mapProd` convert database rows into the app's shape. `listen()` subscribes to new notifications in realtime. Database errors go through `dbMsg()`, which gives friendly text.
- **Requests and tracking:** both roles see requests as compact cards (`reqCard`: current status, date and a progress bar). Tapping a card opens `reqDetail()` (view `rdet`, request `S.rd`), which shows the full step-by-step tracker (`tracker()`) with the date of each step and the shop's note from `status_history`. On the tracking page the owner can type an optional note (`#onote`). `adv` sends it as `owner_note` with the new status, and database triggers copy it into status_history and the customer's notification. The quick "Mark as" button on list cards sends no note. `openReq` and `closeReq` move in and out of it, and the phone's Back button works because opening pushes a history entry. On the Notifications page, all of one request's updates appear as a single entry (`noteGroups`), and tapping it opens the tracker.
- **Statuses:** `FLOW[type]` lists the steps for each request type, and `isDone(r)` is true at the last step. The owner's request filters live in `OF` (open, repair, new, done).
- **Owner screens:** `owner()` with the views orq, prod, pedit, notes and profile. Product photos are shrunk to 1200px JPEG in the browser, then uploaded to the public `product-photos` bucket.
- **Footer:** `FOOT` adds the copyright line to every screen. `privacy.html` and `terms.html` have their own copy of it.
- **Design:** colours are CSS variables in `:root` (with dark-mode overrides). Buttons use the classes `.b`, `.b.o` (outline), `.b.g` (green) and `.b.sm`, plus `.lnk`, `.chip` and `.stat`. All buttons turn blue while pressed. Keep the layout working at 480px wide and below.

## Roles and security

- `profiles.role` is either `customer` or `owner`. The owner is set by hand in SQL (see `backend/README.md`).
- Row level security plus `public.is_owner()` enforce what each person can do. The UI hiding something is not the protection.
- New Supabase projects give app users no table access by default. A new table needs grants (as in `002_app_access.sql`) as well as policies.
- **Never ask for, handle or commit the Supabase secret key.** Only the publishable key belongs in code. `mobile/.env` is local only and ignored by git.
- Don't put the user's personal email into code, commits or requests to outside services.

## Testing (no Node here)

This machine has no node, npm or brew.
- **Syntax check:** copy the last `<script>` of `index.html` into a file wrapped in `function f(){...}`, then run it with `/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc`.
- **Behaviour:** copy `index.html` into the scratchpad and replace the supabase-js `<script>` tag with a small stand-in `window.supabase`. Add a script that clicks through the flow and sends results to a tiny Python server (`GET /log?msg`), then run headless Chrome (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --headless=new`). Don't use `--virtual-time-budget`; it stalls async flows.
- Headless Chrome's smallest window is 500px wide. Check narrow layouts by measuring for overflow, not by eye.

## Workflow

- Wording: say "Aayush Computers" (with "AAYUSH COMPUTERS" in the header). Use plain, friendly text. Never claim an SMS, email or notification was sent unless it really was.
- Commit when the user asks. `git push` doesn't work from this session (no credentials), so the user pushes with `! git push origin main`.
- After a push, browsers can keep the old copy for up to 10 minutes. Tell the user to open the site with `?v=<n>` added to the address to see changes straight away.
