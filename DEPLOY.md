# Deploying to shared hosting (cPanel)

The site is plain static files plus one small PHP script (`contact.php`). The server needs **no Node.js**.
Requirements: Apache with `.htaccess` enabled (standard on cPanel) and PHP 5.6 or newer with `mail()` working.

## 1. Get the files

Pick one:

- **From GitHub:** open the latest run of the *Main Branch Quality & Security Checks* workflow and download the
  `site-dist` artifact. Unzip it; its contents are the files to upload.
- **Locally:** `npm ci && npm run build`, then use the contents of the `dist/` folder.

## 2. Upload

Upload everything inside `dist/` (not the `dist` folder itself) into `public_html/`
(or the document root of the domain). In cPanel File Manager enable **Show Hidden Files** so `.htaccess` is
included. Overwrite existing files. Leftovers from the old single-page version (`js/app.js` old copy, `data/`,
`index.html` from before) are replaced or can be deleted.

Take a backup of `public_html/` first (cPanel > Backup, or download a zip).

## 3. Check

- `https://loopstech.com/`, `/ar/`, `/it-services-for-construction-in-saudi-arabia/`, `/ar/it-services-for-construction-in-saudi-arabia/` load.
- `https://loopstech.com/does-not-exist/` shows the 404 page.
- Submit the form on `/contact/`. Every inquiry is saved to `leads/leads-YYYY-MM.jsonl` one level above `public_html` (never web-accessible).
- Email: some hosts (Hostinger included) disable PHP `mail()`. To get inquiries by email, copy `docs/contact-config.sample.php` to
  `contact-config.php` one level above `public_html`, and fill in the SMTP mailbox password. Until then, read the leads file.

## Notes

- The `.htaccess` only uses modules wrapped in `<IfModule>`, so a host missing a module skips that part
  instead of returning a 500 error.
- Turn on **Force HTTPS** in cPanel (Domains) so HTTP redirects to HTTPS. It is not in `.htaccess` because
  the correct rule depends on the host's proxy setup.
- Submit `https://loopstech.com/sitemap.xml` in Google Search Console after the first deploy.
- To change the destination email, edit `CONTACT_TO` at the top of `public/contact.php`, rebuild and re-upload.

## Local development

```
npm ci
npm run build   # writes dist/
npm run check   # link, SEO and sitemap checks
```

Serve `dist/` with any static server (for example `npx serve dist`). Forms need PHP, so submitting the contact
form only works on the real host.
