import { useState } from "react";
import { Globe2 } from "lucide-react";
import { getProjectUrl } from "../projectUrls";

export default function ProjectPreview({ project, interactive = false }) {
  const url = getProjectUrl(project);
  const image = project.image?.trim();
  const [failedImage, setFailedImage] = useState(null);
  return (
    <div
      className={`project-preview ${interactive ? "project-preview-interactive" : "project-preview-thumbnail"}`}
    >
      {url ? (
        <iframe
          className="project-preview-frame"
          src={url}
          title={`${project.title} ${interactive ? "live website" : "website preview"}`}
          loading={interactive ? "eager" : "lazy"}
          tabIndex={interactive ? 0 : -1}
          aria-hidden={interactive ? undefined : true}
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      ) : image && !image.endsWith("/") && failedImage !== image ? (
        <img
          src={image}
          alt={`${project.title} interface preview`}
          width="900"
          height="640"
          loading="lazy"
          onError={() => setFailedImage(image)}
        />
      ) : (
        <div className="project-preview-placeholder">
          <Globe2 size={40} strokeWidth={1.25} aria-hidden="true" />
          <span>{project.title}</span>
        </div>
      )}
    </div>
  );
}
