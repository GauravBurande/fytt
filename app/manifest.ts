import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fytt",
    short_name: "Fytt",
    description: "Get nutrition insights of any food with just a click.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#90EC8E",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
