# Backend configuration checklist

## Before launch

- [ ] Create the Google Sheet and deploy `google-apps-script/Code.gs` as a Web App. See [GOOGLE-SHEETS-SETUP.md](./GOOGLE-SHEETS-SETUP.md).
- [ ] Set `apiUrl` in `config.js` to the active Apps Script `/exec` URL.
- [ ] Optionally replace the `siteUrl` placeholder in `config.js` with the final HTTPS website URL; `main.js` does not currently read this property.
- [ ] Deploy the complete website folder without changing its relative file structure.
- [ ] Confirm the Web App access setting permits the intended guests to submit responses.

## Acceptance test

- [ ] Open the deployed HTTPS website and confirm the RSVP section reports that Google Sheets is connected.
- [ ] Submit a test RSVP. Confirm a row appears in `RSVP` and the page displays its confirmation ID.
- [ ] Submit a test wish. Confirm a row appears in `Wishes` with `Pending`.
- [ ] Change the test wish to `Approved`, reload the website and confirm it is listed.
- [ ] Change a test wish to another status, reload, and confirm it is not listed.

## Operational notes

- The browser verifies a submission by querying for its ID after sending it. A timeout or missing ID is reported as an error; it is not a confirmed save.
- New wishes are saved as `Pending` and shown only in the sender's current page. Only approved wishes are returned by the backend on page load.
- `siteUrl` does not currently affect the site behavior. The configured RSVP deadline is not enforced by the current form.
- VietQR gift details and the official YouTube embed for “Hơn Cả Yêu” are configured in the current page.
- Do not place secrets or sensitive personal data in frontend configuration or the public spreadsheet.
