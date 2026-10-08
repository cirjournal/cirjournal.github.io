# Archive: how to publish a new issue

`archive.html` is built in the browser from **`Archive/archive.json`**.
To publish a new issue you only edit that JSON file; no HTML changes are needed.

## Steps

1. **Upload the PDFs** to a new folder, e.g. `Archive/Volume2-Issue1/`.
2. **(Optional) Add a cover image** at `assets/img/covers/v2-i1.jpg`.
   Without one, a navy placeholder cover is shown.
3. **Edit `Archive/archive.json`:**
   - Set `"current": false` on the previous issue.
   - Add the new issue to the `"issues"` list (copy the Volume 1 entry as a template) with `"current": true`.
4. **Upload** `archive.json` and the new folder to the server. That's it.

The newest issue appears first in the issue tabs and is shown by default.
Each issue and article can be linked directly, e.g. `archive.html#v2-i1` or `archive.html#v2-i1-a3`.

## Minimal issue entry

```json
{
  "id": "v2-i1",
  "volume": 2,
  "issue": 1,
  "year": 2027,
  "month": "June",
  "description": "Regular Issue",
  "current": true,
  "cover": { "image": "assets/img/covers/v2-i1.jpg", "pdf": "Archive/Volume2-Issue1/1. Cover page.pdf" },
  "frontMatter": [
    { "id": "v2-i1-toc", "type": "toc", "title": "Table of Contents", "pdf": "Archive/Volume2-Issue1/Table of content.pdf" }
  ],
  "articles": [
    {
      "id": "v2-i1-a1",
      "title": "Article title",
      "authors": [ { "name": "Author Name", "affiliation": "Department, University" } ],
      "pages": { "start": 1, "end": 12 },
      "pdf": "Archive/Volume2-Issue1/article-1.pdf"
    }
  ]
}
```

## Field reference

**Required:** `volume`, `issue`, and for each article `title`.

**Optional** (left out → simply not shown):

| Field | Notes |
|---|---|
| `id` | Used in links. Defaults to `v{volume}-i{issue}`. Article ids should be unique, e.g. `v2-i1-a1`. |
| `month`, `year`, `description` | Shown in the issue heading. |
| `current` | Marks the "Current Issue". If none is set, the newest issue is used. |
| `cover.image`, `cover.pdf` | Cover thumbnail and the PDF it links to. |
| `frontMatter[]` | `title`, `pdf`, `pages`, `type` (`"toc"` also adds the Table of Contents button). |
| article `type` | Defaults to "Research Article". |
| article `authors[]` | `name`, `affiliation`, `email`, `corresponding`. |
| article `pages` | `{ "start": 5, "end": 17 }` |
| article `received`, `accepted`, `published` | Dates as `YYYY-MM-DD`. |
| article `keywords`, `jel` | Lists of strings. |
| article `abstract` | Plain text. |
| article `doi` | e.g. `10.1234/cjiar.2027.001`, shown as a link. |
| article `pdf` | Path to the PDF. Without it, "PDF coming soon" is shown. |
| article `fileSizeBytes` | Shown next to the download button. |

## Tips

- JSON is strict: use double quotes, no trailing comma after the last item.
  Check your edit at <https://jsonlint.com> before uploading.
- Paths are relative to the website root and may contain spaces.
- The page needs a web server; opening `archive.html` straight from disk
  (`file://`) blocks the JSON from loading. To preview locally, run
  `python -m http.server` in the website folder and open <http://localhost:8000/archive.html>.
