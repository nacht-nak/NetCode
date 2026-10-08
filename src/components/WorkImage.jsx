import { useState } from "react";
import { ImageOff } from "lucide-react";

export default function WorkImage({ item, index }) {
  const source = item.image?.trim() || item.photo?.trim();
  const [failedSource, setFailedSource] = useState(null);
  const alt =
    item.alt?.trim() || item.title?.trim() || `Project ${index + 1} photo`;

  return (
    <figure className="completed-work-card">
      <div className="completed-work-image">
        {source && failedSource !== source ? (
          <img
            src={source}
            alt={alt}
            width="960"
            height="600"
            loading="lazy"
            style={{ objectFit: item.fit === "contain" ? "contain" : "cover" }}
            onError={() => setFailedSource(source)}
          />
        ) : (
          <div
            className="completed-work-placeholder"
            role="img"
            aria-label={alt}
          >
            <ImageOff size={36} strokeWidth={1.25} aria-hidden="true" />
          </div>
        )}
      </div>
    </figure>
  );
}
