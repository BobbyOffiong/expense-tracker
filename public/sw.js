self.addEventListener("install", (event) => {
  console.log("Service Worker: Installed");
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");
});

// Optional: cache assets (you can expand this later)
self.addEventListener("fetch", (event) => {
  // For now, let requests pass through
});
