/**
 * ArabTides — email sign-ups → this Google Sheet.
 * Paste into Extensions → Apps Script of your Sheet, then Deploy → Web app (see README.md).
 * The website POSTs: email, source, page, port (+ a hidden "website" honeypot field).
 * The contact page POSTs form=contact with name, reply_to, subject, message, page → "Messages" tab.
 */
const SHEET_NAME = 'Signups';
const HEADERS = ['date', 'email', 'source', 'page', 'port'];
const MESSAGES_SHEET = 'Messages';
const MESSAGES_HEADERS = ['date', 'name', 'email', 'subject', 'message', 'page'];

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.website) return json_({ ok: true });                       // honeypot filled → bot, ignore silently
  if (p.form === 'contact') return contact_(p);
  const email = String(p.email || '').trim().toLowerCase();
  if (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json_({ ok: false, error: 'invalid email' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet_();
    const last = sheet.getLastRow();
    const existing = last > 1 ? sheet.getRange(2, 2, last - 1, 1).getValues().map(r => String(r[0]).toLowerCase()) : [];
    if (existing.indexOf(email) === -1) {
      sheet.appendRow([new Date(), safe_(email), safe_(p.source, 40), safe_(p.page, 200), safe_(p.port, 40)]);
    }
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

// Contact-page message → "Messages" tab (never added to the sign-up list)
function contact_(p) {
  const email = String(p.reply_to || '').trim().toLowerCase();
  const message = String(p.message || '').trim();
  if (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json_({ ok: false, error: 'invalid email' });
  if (!message) return json_({ ok: false, error: 'empty message' });
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    getSheet_(MESSAGES_SHEET, MESSAGES_HEADERS).appendRow([new Date(), safe_(p.name, 100), safe_(email), safe_(p.subject, 60), safe_(message, 5000), safe_(p.page, 200)]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

// Opening the /exec URL in a browser shows this — handy to check the deployment works.
function doGet() {
  return json_({ ok: true, service: 'ArabTides signups', rows: Math.max(0, getSheet_().getLastRow() - 1), contact: true });
}

function getSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(name || SHEET_NAME) || ss.insertSheet(name || SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(headers || HEADERS);
  return sheet;
}

// Stop values like "=HYPERLINK(...)" from being treated as formulas; cap length.
function safe_(v, max) {
  let s = String(v || '').slice(0, max || 200);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
