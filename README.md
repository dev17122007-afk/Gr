# Garba Night RSVP

A five-page Garba invitation with a required Yes/No RSVP on Page 2 and an arrival-time response on Page 3.

## Live links

- Website: https://dev17122007-afk.github.io/Gr/
- Google Sheet: https://docs.google.com/spreadsheets/d/1mtoT48c35svVbtLqSI1IXrG059QwXBYd9AhRmRTqkwM/edit
- Apps Script receiver: https://script.google.com/macros/s/AKfycbwGchWsIGJ5TPb8AuofyCwzCScYJJNW1VyjGQxGPn8CWO9oh25UqwKBtn4rQvjKS29Lkw/exec

## What gets recorded

The public site sends a response to the Apps Script web app. The Sheet link is stored in the Apps Script project property SPREADSHEET_URL, not in the public site source. Responses are written to a tab named RSVP Responses with columns for received time, browser session ID, Page 2 answer, Page 3 arrival time, Page 3 time choice, and browser submission time.

Page 2 records Yes or No. A Yes response must select an arrival time on Page 3 or choose “I’ll let you know soon.” A No response is recorded as an opt-out and does not ask for an arrival time. A later update from the same browser session updates that session’s existing row.

The receiver is deployed to run as the owner and accepts submissions from anyone. Keep the Google Sheet private; public site visitors submit through the receiver and do not need Sheet access.

## Receiver maintenance

The Apps Script source is in Code.gs. If the Sheet changes, update the SPREADSHEET_URL script property in Project Settings. If the receiver code changes, save it and deploy a new version using Manage deployments so the existing web app URL stays in place. The website sends JSON as text/plain so browsers can submit without a CORS preflight.
