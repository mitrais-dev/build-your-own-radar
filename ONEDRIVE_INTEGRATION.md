# OneDrive Integration Guide

## Using Excel Files from OneDrive Public Links

The application now supports fetching Excel files directly from OneDrive public links!

### Steps:

#### 1. Share File on OneDrive

- Open the Excel file on OneDrive
- Click **"Share"**
- Select **"Copy link"** and ensure access is set to **"Anyone can view"**
- Example link:
  ```
  https://1drv.ms/x/s!xxxxxxxxxx
  ```

#### 2. Use Link in Application

Enter the OneDrive URL to the `?documentId=` parameter or input it in the form:

```
http://localhost:8080/?documentId=https://1drv.ms/x/s!xxxxxxxxxx
```

or

```
http://localhost:8080/?documentId=https://onedrive.live.com/...
```

#### 3. (Optional) Specify Sheet

If the file has multiple sheets, add the `&sheetName=sheetname` parameter:

```
http://localhost:8080/?documentId=https://1drv.ms/x/s!xxxxxxxxxx&sheetName=2023-S1
```

---

## Technical Details

### Supported URL Formats:

- ✅ `https://1drv.ms/x/s!...` (Short OneDrive links)
- ✅ `https://onedrive.live.com/...` (Full OneDrive URLs)
- ✅ `https://.sharepoint.com/...` (SharePoint links)

### How It Works:

1. **Link Detection**: Factory detects if the URL is a OneDrive URL
2. **URL Conversion**: OneDriveUtil converts the sharing link to a direct download URL
3. **Fetch File**: Fetches Excel file
4. **Parse Data**: Uses `xlsx` library to parse Excel data
5. **Render**: Displays radar visualization
