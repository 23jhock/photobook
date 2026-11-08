# IIAN Server Photobook

Each gallery uses the same numbered filename convention: `img (1).jpg`, `img (2).jpg`, and so on. PNG files are also supported. If both JPG and PNG exist for a number, JPG is used first and PNG is kept as a fallback.

## Adding photos

1. Put the photos in the matching gallery folder.
2. Name them `img (1).jpg`, `img (2).jpg`,
3. Run in repo terminal:

   ```powershell
   py generate-manifest.py
   ```

## Features

- Server and era tabs, plus a Misc. dropdown
- Progressive loading in batches of 30
- Lazy loading and off-screen image unloading
- Responsive three-/two-column photo grid
- Hover effects
- Click-to-enlarge lightbox with previous/next, Escape, and arrow-key navigation
- Accessible labels and reduced-motion support

## Project files

- `index.html` — page structure and navigation
- `styles.css` — layout and styling
- `script.js` — gallery loading and lightbox behavior
- `image-manifest.json` — generated list of available images
- `generate-manifest.py` — local manifest generator
