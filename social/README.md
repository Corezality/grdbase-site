# GRD Base social assets

Brand-matched post templates and PNG exports for Instagram, Facebook, and LinkedIn.

## Quick start

```bash
cd grdbase-site/social
npm install
npm run export
```

PNG files are written to `output/`. Copy text from `SOCIAL-MEDIA-KIT.md`.

## Preview in browser

Open any file in `html/` (e.g. `html/post-01-launch.html`) in Chrome to preview before export.

## Regenerate after edits

1. Edit HTML in `html/` or styles in `shared.css`
2. Run `npm run export`

## Sizes

| File prefix | Size |
|-------------|------|
| `post-*` | 1080×1080 (IG/FB feed & carousel) |
| `linkedin-*` | 1200×627 (LinkedIn feed image) |
