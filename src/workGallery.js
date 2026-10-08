// Put project photos, screenshots, certificates, or award images in public/work/.
// Replace these placeholders with your own image paths and descriptive alt text.
// Both image and photo are supported; image takes priority if both are set.
// Use fit: "contain" for certificates to show the entire image without cropping.
// Add or remove entries to change the number of gallery cards.
export const workGallery = [
  {
    id: "work-01",
    title: "Completed work",
    category: "Project",
    image: "/work/placeholder.svg",
    alt: "Completed work image placeholder",
    fit: "cover",
  },
  {
    id: "work-02",
    title: "Certificates & awards",
    category: "Achievement",
    photo: "./gallery/sac.jpg",
    alt: "Achievement image placeholder",
    fit: "contain",
  },
  {
    id: "work-03",
    title: "Milestones & events",
    category: "Milestone",
    image: "./gallery/tavb.jpg",
    alt: "Milestone image placeholder",
    fit: "cover",
  },
];
