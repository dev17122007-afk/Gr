const RESPONSES_TAB_NAME = "RSVP Responses";
const RESPONSE_HEADERS = [
  "Received at",
  "Session ID",
  "Page 2 response",
  "Page 3 arrival time",
  "Page 3 time choice",
  "Browser sent at"
];

/**
 * Health check for the deployed web app.
 * The sheet link is stored privately in Apps Script Script Properties.
 */
function doGet() {
  const sheet = getResponsesSheet_();
  return json_({
    ok: true,
    service: "Garba RSVP receiver",
    tab: sheet.getName()
  });
}

/**
 * Accepts one RSVP submission and upserts it by browser session ID.
 * Requests are sent as text/plain JSON to avoid a browser CORS preflight.
 */
function doPost(e) {
  try {
    const contents = e && e.postData && e.postData.contents;
    if (!contents) return json_({ ok: false, error: "Missing request body." });

    const payload = JSON.parse(contents);
    const response = String(payload.response || "").trim().toLowerCase();
    const sessionId = safeText_(payload.sessionId, 100);

    if (!sessionId || (response !== "yes" && response !== "no")) {
      return json_({ ok: false, error: "A session ID and Yes/No RSVP are required." });
    }

    let arrivalTime = "";
    let timeChoice = "not_applicable";

    if (response === "yes") {
      timeChoice = String(payload.timeStatus || "");
      if (timeChoice === "entered") {
        arrivalTime = validateTime_(payload.arrivalTime);
        if (!arrivalTime) return json_({ ok: false, error: "Enter a valid arrival time." });
      } else if (timeChoice === "will_confirm_later") {
        arrivalTime = "";
      } else {
        return json_({ ok: false, error: "Choose an arrival time or choose to confirm later." });
      }
    }

    const sentAt = safeText_(payload.submittedAt, 40);
    const row = [
      new Date(),
      sessionId,
      response === "yes" ? "Yes" : "No",
      arrivalTime,
      timeChoice,
      sentAt
    ];

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = getResponsesSheet_();
      if (sheet.getLastRow() === 0) sheet.appendRow(RESPONSE_HEADERS);

      const lastRow = sheet.getLastRow();
      let matchingRow = 0;
      if (lastRow > 1) {
        const ids = sheet.getRange(2, 2, lastRow - 1, 1).getDisplayValues();
        const index = ids.findIndex(item => item[0] === sessionId);
        if (index >= 0) matchingRow = index + 2;
      }

      if (matchingRow) {
        sheet.getRange(matchingRow, 1, 1, row.length).setValues([row]);
      } else {
        sheet.appendRow(row);
      }
    } finally {
      lock.releaseLock();
    }

    return json_({ ok: true });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, error: "Could not save the RSVP." });
  }
}

function getResponsesSheet_() {
  const url = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_URL");
  if (!url) throw new Error('Add a Script Property named "SPREADSHEET_URL".');

  const match = url.match(/\/spreadsheets\/d\/([A-Za-z0-9_-]+)/);
  if (!match) throw new Error("SPREADSHEET_URL must be a Google Sheets URL.");

  const spreadsheet = SpreadsheetApp.openById(match[1]);
  return spreadsheet.getSheetByName(RESPONSES_TAB_NAME)
    || spreadsheet.insertSheet(RESPONSES_TAB_NAME);
}

function validateTime_(value) {
  const time = String(value || "");
  const match = time.match(/^(\d{2}):(\d{2})$/);
  if (!match) return "";
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour <= 23 && minute <= 59 ? time : "";
}

function safeText_(value, limit) {
  let text = String(value || "").trim().slice(0, limit);
  if (/^[=+\-@]/.test(text)) text = "'" + text;
  return text;
}

function json_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
