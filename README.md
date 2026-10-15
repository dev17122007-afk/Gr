# Garba Night RSVP

A five-page Garba invitation site with an explicit Yes/No RSVP on Page 2 and an arrival-time choice on Page 3.

## Google Sheets receiver setup

The site code includes a clearly marked `GOOGLE_SCRIPT_URL` setting. The response receiver is in `Code.gs`. The Google Sheet link is kept in Apps Script settings, so it is not exposed in the public website source.

1. Open [Google Apps Script](https://script.google.com/home/projects/create) and create a project.
2. Copy the contents of `Code.gs` into the Apps Script editor and save.
3. In **Project Settings → Script properties**, add:
   - **Property:** `SPREADSHEET_URL`
   - **Value:** the Google Sheets URL where responses should be stored
4. Choose **Deploy → New deployment → Web app**. Set **Execute as** to yourself and **Who has access** to **Anyone**, then deploy and authorize the script.
5. Copy the deployed Web app URL. In `index.html`, replace `PASTE_WEB_APP_URL_HERE` in `GOOGLE_SCRIPT_URL` with that URL and commit the change to `main`.

The site writes one row per browser session to a tab named **RSVP Responses**. Page 2 stores **Yes** or **No**. For Yes responses, Page 3 stores the entered time or the explicit “will confirm later” choice. A later change in the same session updates that row.

Until the Web app URL is added to `index.html` and the receiver is deployed, the site can be viewed but submissions will not reach the Sheet.
