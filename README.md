# Signiji Beauty — One-page Website

A lightweight, vanilla HTML/CSS/JS site you can open in VS Code and deploy anywhere.

## Quick start
1. Unzip the folder.
2. Open it in VS Code.
3. Use the Live Server extension (or any static server) to preview `index.html`.

## Replace images
Put your real photos into `assets/` and update paths if needed:
- `assets/hero-placeholder.jpg` — background photo for the hero section.
- `assets/signiji.jpg` — portrait in the About section.
- `assets/gallery-*.jpg` — gallery items.

To change the hero background, replace the file **or** edit the CSS rule in `css/styles.css`:
```css
.hero { background: url('../assets/your-photo.jpg') center/cover no-repeat; }
```

## SEO
- Edit `<title>` and `<meta name="description">` in `index.html` for any final wording tweaks.
- Update JSON-LD phone, address, and social links when ready.

## Structure
```
/assets         # images
/css/styles.css # styles
/js/main.js     # small enhancements
index.html      # page markup with sections
```

## Notes
- Fonts are loaded from Google Fonts (Playfair Display + Inter).
- No build step required; pure static files.
