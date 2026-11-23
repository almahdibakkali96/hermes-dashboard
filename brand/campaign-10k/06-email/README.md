# Calendar 2027 email campaign (Brevo)

Three emails to everyone who left an email on the site (old guide sign-ups + new calendar sign-ups) and guide buyers.
Each one is personal to the reader's port when we know it, and falls back to «ميناءك» when we don't.

| # | File | Send | To | Subject |
|---|---|---|---|---|
| 1 | `email-1-launch.html` | **Tue 24 Nov, 09:00 Mecca time** (full moon) | whole list | تقويم 2027 {{port}} جاهز |
| 2 | `email-2-numbers.html` | **Wed 2 Dec, 09:00** | list minus buyers | {{port}} في 2027: كم يوماً ممتازاً للصيد؟ |
| 3 | `email-3-last-day.html` | **Sun 6 Dec, 09:00** (launch price ends 23:59) | list minus buyers | آخر يوم لسعر الإطلاق 4.99$ |

Preview texts (Brevo's "Preview text" field): printed by `node build.mjs`, also below.
1. سنة كاملة يوماً بيوم، بسعر الإطلاق 4.99$ حتى 6 ديسمبر
2. حسبنا السنة كلها يوماً بيوم. هذه أرقام ميناءك
3. الليلة عند 23:59 بتوقيت مكة يعود السعر إلى 6.99$

Email 2 shows the reader's own port numbers (e.g. «105 يوماً ممتازاً للصيد في الدار البيضاء، وأفضل شهر أكتوبر»),
the same numbers as page 2 of their PDF and the /calendar page. Readers without a port see Dubai as an example.
Every button goes to `/calendar?port=<their port>` (port already picked) with `utm_source=email`, `utm_content=e1/e2/e3`.

## Files

- `contacts.mjs`: merges your CSV exports into `output/brevo-contacts.csv` (one row per email, newest port wins, buyers removed).
- `build.mjs`: rebuilds the three HTML emails after any wording change.
- `port-stats.json`: each port's Arabic name, excellent days and best month (from the site build, same as the PDFs).
- `input/` and `output/` are gitignored: real emails never go in the public repo.
- Images are served by the site from `/email/*.jpg` (`public/email/`), so **the site must be deployed before email 1 goes out.**

## Your steps

### 1. Brevo account and sender (once, ~20 min)
1. Sign up at brevo.com (free plan: 300 emails a day; see step 6 if your list is bigger).
2. **Authenticate the domain**: Brevo → *Senders, Domains & Dedicated IPs* → *Domains* → *Add a domain* → `arabtides.com`.
   Brevo shows 3–4 DNS records (a `brevo-code` TXT, DKIM, and DMARC).
   Add each one in **Vercel → Domains → arabtides.com → DNS Records** (your DNS is on Vercel), then click *Verify* in Brevo.
   If Brevo says you have no DMARC record, add TXT `_dmarc` = `v=DMARC1; p=none;`. Gmail and Yahoo junk bulk mail without it.
3. **Sender**: *Senders* → add `ArabTides` / `hello@arabtides.com` (works once the domain is authenticated).
   Set the **reply-to** to your own Gmail so replies reach you.

### 2. Export your contacts
Save each as CSV into `brand/campaign-10k/06-email/input/`:
1. **Google Sheet**, tab *Signups – guide* → File → Download → CSV. Do the same for tab *Signups*.
   Skip the *Messages* tab: those people wrote to you but didn't sign up for emails.
2. **Guide buyers** (optional): Stripe → Payments → filter *Succeeded*, dates up to 17 Nov → Export, with the
   *Customer Email* column. Name the file `stripe-guide-buyers.csv`.
3. **Calendar buyers so far**: Stripe → Payments → from 23 Nov → Export → put it in `input/exclude/`.
4. Any old list (e.g. from Gmail) works too: any CSV with an "email" column.

### 3. Build the import file
```
node brand/campaign-10k/06-email/contacts.mjs
```
It prints how many contacts it kept and which typed port names it couldn't match (fix those by hand in the CSV if you like).

### 4. Import into Brevo
1. *Contacts → Settings → Contact attributes*: create these **Text** attributes:
   `PORT`, `PORT_AR`, `PORT_FOR`, `EXCELLENT`, `BEST_MONTH`, `SOURCE`.
2. *Contacts → Import contacts → Upload a file* → `output/brevo-contacts.csv` → check that each column maps to
   the attribute of the same name → new list **"Calendar 2027"** → confirm they signed up (they did, on the site's form).
3. Make a second list **"Calendar buyers"** and import the Stripe calendar-buyers CSV into it (map *Customer Email* → EMAIL).
   Refresh it before emails 2 and 3.

### 5. Deploy the site first
Set `CALENDAR_PAYMENT_LINKS` in Vercel (from earlier), then tell me to push, or push yourself. That deploy also puts
the email images live at `https://www.arabtides.com/email/month.jpg`. Open that URL once to check it loads.

### 6. Create each campaign
1. *Campaigns → Create campaign → Email*. Name it ("Cal 2027 – 1 launch").
2. **Recipients**: list "Calendar 2027". For emails 2 and 3, also **exclude** "Calendar buyers".
3. **Sender**: ArabTides <hello@arabtides.com>. **Subject** and **Preview text**: copy them from the table above, exactly,
   including `{{ contact.PORT_FOR | default : "لميناءك" }}` (Brevo fills it in).
4. **Design** → *Code your own* → paste the whole HTML file.
5. In settings, turn **off** Brevo's "Google Analytics tracking" (the links already carry UTM tags).
6. **Send a test** to your Gmail and open it on your phone: check the port name, the images and the button.
7. **Schedule** for the date in the table.

If the list is over 300 people, either split it in two segments and send on two days (Brevo free plan limit), or take
Brevo's Starter plan for one month.

### 7. Watch
- Sales: Stripe. Email traffic: Vercel Analytics → filter `utm_source = email`.
- Brevo shows opens, clicks and unsubscribes per campaign. Unsubscribes are kept out of later sends automatically.
- If someone replies with a question, it lands in your Gmail (reply-to).
