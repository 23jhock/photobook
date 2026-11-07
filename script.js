const BATCH_SIZE = 30;
const galleryElement = document.getElementById("gallery");
const galleryTitle = document.getElementById("gallery-title");
const galleryStatus = document.getElementById("gallery-status");
const galleryMessage = document.getElementById("gallery-message");
const loadMoreButton = document.getElementById("load-more");
const navButtons = document.querySelectorAll("[data-gallery-id]");
const miscMenu = document.querySelector(".misc-menu");

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxFilename = document.getElementById("lightbox-filename");
const lightboxCounter = document.getElementById("lightbox-counter");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxPrevious = document.getElementById("lightbox-previous");
const lightboxNext = document.getElementById("lightbox-next");

let galleries = [];
let activeGallery = null;
let visibleCount = 0;
let activeLightboxIndex = -1;
let lastFocusedElement = null;
let imageObserver = null;

function filenameFromPath(path) {
  return path.split("/").pop();
}

function updateGalleryStatus() {
  const total = activeGallery.images.length;
  galleryStatus.textContent = `Showing ${Math.min(visibleCount, total)} of ${total} photos`;
  loadMoreButton.hidden = visibleCount >= total || total === 0;
  loadMoreButton.disabled = false;
}

function loadImage(img) {
  if (img.dataset.failed === "true" || img.hasAttribute("src")) return;
  img.dataset.requested = "true";
  img.src = img.dataset.primary;
}

function unloadImage(img) {
  if (img.dataset.requested !== "true" || img.dataset.failed === "true") return;
  img.removeAttribute("src");
  img.dataset.requested = "false";
  img.dataset.fallbackTried = "false";
}

function observeImage(img) {
  if (imageObserver) {
    imageObserver.observe(img);
  } else {
    loadImage(img);
  }
}

function createPhoto(image, index) {
  const button = document.createElement("button");
  button.className = "photo";
  button.type = "button";
  button.setAttribute("aria-label", `Open photo ${filenameFromPath(image.src)}`);

  const img = document.createElement("img");
  img.alt = filenameFromPath(image.src);
  img.width = 640;
  img.height = 360;
  img.loading = "lazy";
  img.decoding = "async";
  img.dataset.primary = image.src;
  img.dataset.fallback = image.fallback || "";
  img.dataset.fallbackTried = "false";
  img.dataset.requested = "false";

  img.addEventListener("error", () => {
    if (img.dataset.fallback && img.dataset.fallbackTried !== "true") {
      img.dataset.fallbackTried = "true";
      img.src = img.dataset.fallback;
      return;
    }
    img.dataset.failed = "true";
    button.classList.add("image-error");
    img.remove();
  });

  button.appendChild(img);
  button.addEventListener("click", () => openLightbox(index));
  observeImage(img);
  return button;
}

function appendBatch() {
  if (!activeGallery) return;
  const nextCount = Math.min(visibleCount + BATCH_SIZE, activeGallery.images.length);
  const fragment = document.createDocumentFragment();

  for (let index = visibleCount; index < nextCount; index += 1) {
    fragment.appendChild(createPhoto(activeGallery.images[index], index));
  }

  galleryElement.appendChild(fragment);
  visibleCount = nextCount;
  updateGalleryStatus();

  if (activeGallery.images.length === 0) {
    galleryMessage.textContent = "No photos in this collection yet.";
    galleryMessage.hidden = false;
  } else {
    galleryMessage.hidden = true;
  }
}

function selectGallery(galleryId) {
  const selected = galleries.find((item) => item.id === galleryId);
  if (!selected) return;

  if (imageObserver) imageObserver.disconnect();
  galleryElement.replaceChildren();
  activeGallery = selected;
  visibleCount = 0;
  galleryTitle.textContent = `${selected.title} Gallery`;
  galleryMessage.hidden = true;

  navButtons.forEach((button) => {
    const isActive = button.dataset.galleryId === galleryId;
    if (button.classList.contains("nav-button")) {
      button.setAttribute("aria-pressed", String(isActive));
    }
  });

  if (miscMenu && galleryId === "uhcs") miscMenu.open = false;

  if ("IntersectionObserver" in window) {
    imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const img = entry.target;
        if (entry.isIntersecting) {
          loadImage(img);
        } else {
          unloadImage(img);
        }
      });
    }, { rootMargin: "900px 0px" });
  } else {
    imageObserver = null;
  }

  appendBatch();
}

function openLightbox(index) {
  if (!activeGallery || !activeGallery.images[index]) return;
  activeLightboxIndex = index;
  lastFocusedElement = document.activeElement;
  updateLightbox();
  lightbox.showModal();
  lightboxClose.focus();
}

lightboxImage.addEventListener("error", () => {
  const fallback = lightboxImage.dataset.fallback;
  if (fallback && lightboxImage.dataset.fallbackTried !== "true") {
    lightboxImage.dataset.fallbackTried = "true";
    lightboxImage.src = fallback;
  }
});

function updateLightbox() {
  const image = activeGallery.images[activeLightboxIndex];
  const path = image.src;
  lightboxImage.dataset.fallback = image.fallback || "";
  lightboxImage.dataset.fallbackTried = "false";
  lightboxImage.src = path;
  lightboxImage.alt = filenameFromPath(path);
  lightboxFilename.textContent = filenameFromPath(path);
  lightboxCounter.textContent = `${activeLightboxIndex + 1} / ${activeGallery.images.length}`;
  lightboxPrevious.disabled = activeLightboxIndex === 0;
  lightboxNext.disabled = activeLightboxIndex === activeGallery.images.length - 1;
}

function closeLightbox() {
  if (lightbox.open) lightbox.close();
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => selectGallery(button.dataset.galleryId));
});

loadMoreButton.addEventListener("click", appendBatch);
lightboxClose.addEventListener("click", closeLightbox);
lightboxPrevious.addEventListener("click", () => {
  if (activeLightboxIndex > 0) {
    activeLightboxIndex -= 1;
    updateLightbox();
  }
});
lightboxNext.addEventListener("click", () => {
  if (activeLightboxIndex < activeGallery.images.length - 1) {
    activeLightboxIndex += 1;
    updateLightbox();
  }
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

lightbox.addEventListener("close", () => {
  lightboxImage.removeAttribute("src");
  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
});

document.addEventListener("keydown", (event) => {
  if (!lightbox.open) return;
  if (event.key === "ArrowLeft" && activeLightboxIndex > 0) {
    activeLightboxIndex -= 1;
    updateLightbox();
  } else if (event.key === "ArrowRight" && activeLightboxIndex < activeGallery.images.length - 1) {
    activeLightboxIndex += 1;
    updateLightbox();
  }
});

async function initializePhotobook() {
  try {
    const response = await fetch("./image-manifest.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`Manifest request failed: ${response.status}`);
    const manifest = await response.json();

    if (!Array.isArray(manifest.galleries)) {
      throw new Error("The image manifest does not contain a galleries list.");
    }

    galleries = manifest.galleries.filter((item) =>
      item && typeof item.id === "string" &&
      typeof item.title === "string" &&
      Array.isArray(item.images)
    );

    if (galleries.length === 0) throw new Error("No galleries are configured.");

    selectGallery("cobblemon");
  } catch (error) {
    console.error("Unable to load the photobook:", error);
    galleryTitle.textContent = "Unable to load the photobook";
    galleryStatus.textContent = "";
    galleryMessage.textContent = "The photo list could not be loaded. Please refresh the page or try again later.";
    galleryMessage.hidden = false;
    loadMoreButton.hidden = true;
  }
}

initializePhotobook();
