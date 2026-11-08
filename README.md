# IIAN Server Photobook

Each gallery uses the same numbered filename convention: `img (1).jpg`, `img (2).jpg`, and so on. PNG files are also supported. If both JPG and PNG exist for a number, JPG is used first and PNG is kept as a fallback.

## Adding photos

1. Put the photos in the matching gallery folder.
2. Name them `img (1).jpg`, `img (2).jpg`, etc. Numbering can contain gaps; the manifest includes only files that exist.
3. Regenerate the image list from the repository root:

   **Windows**
   ```powershell
   py generate-manifest.py
   ```

4. Commit the photos and the updated `image-manifest.json` together.

The generator uses only Python's standard library. GitHub Pages cannot list a folder's contents at runtime, so the generated manifest is how the static site knows which images are available.

## Loading and performance

- The gallery adds up to 30 photos per batch using **Load More Photos**.
- Images are requested only when they approach the viewport, using `IntersectionObserver` and native lazy loading.
- Images well outside the viewport have their `src` released; scrolling back loads them again. This helps keep decoded image memory bounded during long browsing sessions.
- Images are decoded asynchronously, and fixed aspect ratios prevent layout shifts.
- Only the selected gallery is rendered. Switching tabs starts that gallery at its first batch.
- The lightbox loads one full-size image at a time.

The browser may retain downloaded image files in its normal HTTP cache, but the page avoids keeping every photo decoded and active at once.

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
