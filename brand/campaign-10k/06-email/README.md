# Calendar 2027 email campaign (Brevo)

Three generic emails (same for everyone) to the old guide list + the new calendar sign-ups.
Buttons go to `/calendar` with `utm_source=email&utm_campaign=cal-launch&utm_content=e1/e2/e3`.

| # | File | Send (Mecca time) | Subject | Preview text |
|---|---|---|---|---|
| 1 | `email-1-launch.html` | Tue 24 Nov, evening | تقويم 2027 لميناءك جاهز | سنة كاملة يوماً بيوم، بسعر الإطلاق 4.99$ حتى 6 ديسمبر |
| 2 | `email-2-numbers.html` | Wed 2 Dec, 09:00 | كم يوماً ممتازاً للصيد في ميناءك سنة 2027؟ | حسبنا السنة كلها يوماً بيوم لكل ميناء |
| 3 | `email-3-last-day.html` | Sun 6 Dec, 09:00 | آخر يوم لسعر الإطلاق 4.99$ | الليلة عند 23:59 بتوقيت مكة يعود السعر إلى 6.99$ |

Images load from `https://www.arabtides.com/email/*.jpg` (`public/email/`), so the site must be deployed first.
After a wording change in `build.mjs`, run `node brand/campaign-10k/06-email/build.mjs`.

## Steps

1. **Deploy the site** (images): set `CALENDAR_PAYMENT_LINKS` in Vercel, then push. Check
   https://www.arabtides.com/email/month.jpg opens.
2. **Contacts**: Google Sheet → tab *Signups* (the new calendar sign-ups) → File → Download → CSV.
   In Brevo → Contacts → Import → upload it into your existing list (the old guide list), or a new list, mapping the
   `email` column to EMAIL. Brevo merges duplicates by email, so people already in the old list aren't doubled.
   Skip the *Messages* tab: those people never signed up for emails.
3. **Buyers list**: Stripe → Payments → from 23 Nov → Export → import into a Brevo list **"Calendar buyers"**
   (map *Customer Email* → EMAIL). Refresh it before emails 2 and 3.
4. **Campaign**: Campaigns → Create → Email
   - Recipients: your list(s); for emails 2 and 3 also **exclude** "Calendar buyers".
   - Subject and preview text: from the table above.
   - Design → *Code your own* → paste the whole HTML file.
   - Turn off Brevo's Google Analytics tracking (links are already tagged).
   - Send a test to yourself, open it on your phone, then schedule.
5. **Watch**: Stripe for sales, Vercel Analytics → `utm_source = email` for clicks to the site.

Brevo free plan sends 300 emails a day: if the list is bigger, send in two batches on two days.
