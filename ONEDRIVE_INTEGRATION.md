# OneDrive Integration Status

OneDrive/SharePoint URL input is no longer supported.

Use a public Google Sheets URL as the data source.

Requirements:

- The sheet must be shared as **Anyone with the link**
- Permission must be **Viewer**

Example:

`http://localhost:8080/?documentId=https://docs.google.com/spreadsheets/d/<YOUR_SHEET_ID>/edit`
