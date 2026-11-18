# Email sign-ups → Google Sheet (5 minutes, free)

The website's sign-up forms (guide page, homepage banner, port pages) send each email to a Google Sheet you own.

## Setup

1. Open https://sheets.new and name the sheet, e.g. **ArabTides signups**.
2. Menu **Extensions → Apps Script**. Delete what's in the editor, paste all of `Code.gs` from this folder, and click 💾 **Save**.
3. Click **Deploy → New deployment**. Click the ⚙️ next to "Select type" and choose **Web app**:
   - Description: `signups`
   - Execute as: **Me**
   - Who has access: **Anyone**

   Click **Deploy**. Google asks you to authorize: choose your account → *Advanced* → *Go to … (unsafe)* → **Allow**. This warning appears because the script is yours and unverified.
4. Copy the **Web app URL**. It ends with `/exec`.
5. Check it: open the URL in your browser. You should see `{"ok":true,"service":"ArabTides signups","rows":0}`.
6. Paste the URL into `src/lib/shop.ts`:
   ```ts
   const SHEET_WEBAPP = 'https://script.google.com/macros/s/…/exec';
   ```
   Alternatively, add it in Vercel as the environment variable `PUBLIC_SIGNUP_URL`. Then redeploy.

New sign-ups appear in the **Signups** tab with the columns: date, email, source (`home`, `port`, `guide`), page, port. Duplicate emails are skipped.

## Contact messages

The contact page (`/contact`) posts to the same web app. Messages go to a separate **Messages** tab with the columns: date, name, email, subject, message, page. They are never added to the sign-up list.

This needs the version of `Code.gs` that has `contact_`. To check, open the `/exec` URL: the answer must include `"contact":true`. If it doesn't, paste the new `Code.gs` and publish a new version (see below). Until then, contact messages are not saved.

## Later

When you're ready to send emails, use **File → Download → CSV** and import it into Brevo, Mailchimp or similar.

If you change `Code.gs`, use **Deploy → Manage deployments → ✏️ → Version: New version**. That keeps the same URL.

## Product waitlists (columns product, utm_source, utm_content)

Forms with a `product` (e.g. the 2027 calendar waitlist on `/calendar`, `product=tide-calendar-2027`) also send
`utm_source` and `utm_content` from the page URL. The script adds these three columns to an older sheet on the first sign-up. **Every sign-up gets its own row, even if the email is already there** (a guide buyer joining the calendar waitlist, someone signing up twice): filter by `product`, or use Data → Data cleanup → Remove duplicates when you need a clean list.
This needs the new `Code.gs` published as a new version (see above). Until then sign-ups still arrive, but without those columns, and emails already in the sheet are skipped.
