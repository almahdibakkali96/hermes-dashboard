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

## Later

When you're ready to send emails, use **File → Download → CSV** and import it into Brevo, Mailchimp or similar.

If you change `Code.gs`, use **Deploy → Manage deployments → ✏️ → Version: New version**. That keeps the same URL.
