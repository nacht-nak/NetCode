import { useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Github,
  UserRound,
} from "lucide-react";
import { projects } from "../data";
import { teamMembers } from "../team";
import { Modal, Reveal } from "./UI";
import ProjectPreview from "./ProjectPreview";

function ProfileImage({ member, compact = false }) {
  return (
    <div
      className={`team-profile-image team-${member.accent || "lavender"} ${compact ? "profile-compact" : ""}`}
    >
      {member.photo ? (
        <img
          src={member.photo}
          alt={member.name}
          width="600"
          height="600"
          loading="lazy"
        />
      ) : (
        <div
          className="team-avatar"
          aria-label={`Profile image placeholder for ${member.name}`}
          role="img"
        >
          <div className="avatar-orbit" />
          <div className="avatar-orbit avatar-orbit-outer" />
          <div className="avatar-circle">
            <UserRound size={56} strokeWidth={1} />
          </div>
          <span className="avatar-initials">
            {member.initials || member.name.slice(0, 2)}
          </span>
        </div>
      )}
      {member.isPlaceholder && (
        <span className="team-preview-label">SAMPLE PROFILE</span>
      )}
    </div>
  );
}

export default function Team() {
  const [selected, setSelected] = useState(null);
  const close = useCallback(() => setSelected(null), []);
  const selectedProjects = selected
    ? projects.filter((project) => selected.projectIds?.includes(project.id))
    : [];
  return (
    <div id="team" className="team-section">
      <Reveal className="team-heading">
        <div>
          <div className="eyebrow">
            <BriefcaseBusiness size={14} />
            THE PEOPLE BEHIND THE CRAFT
          </div>
          <h3>
            Meet Our Team<span className="accent-period">.</span>
          </h3>
          <p>
            Different talents. One shared passion for building something great.
          </p>
        </div>
        {teamMembers.some((member) => member.isPlaceholder) && (
          <span className="tag team-preview-tag">Profile previews</span>
        )}
      </Reveal>
      <div className="team-grid">
        {teamMembers.map((member, index) => (
          <Reveal key={member.id} delay={index * 0.08}>
            <article className="team-card">
              <div className="team-card-profile">
                <ProfileImage member={member} />
                <div className="team-card-content">
                  <h4>{member.name}</h4>
                  <p className="team-title">{member.title}</p>
                </div>
              </div>
              {member.portfolioUrl?.trim() ? (
                <a
                  className="team-portfolio-button"
                  href={member.portfolioUrl.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View portfolio of ${member.name}`}
                >
                  View Portfolio
                  <ArrowRight size={14} />
                </a>
              ) : (
                <button
                  className="team-portfolio-button"
                  onClick={() => setSelected(member)}
                  aria-label={`View portfolio of ${member.name}`}
                >
                  View Portfolio
                  <ArrowRight size={14} />
                </button>
              )}
            </article>
          </Reveal>
        ))}
      </div>
      <AnimatePresence>
        {selected && (
          <Modal
            title={`${selected.name} — Portfolio`}
            onClose={close}
            className="team-portfolio-modal"
          >
            <div className="portfolio-profile">
              <ProfileImage member={selected} compact />
              <div>
                <span className="portfolio-role">{selected.title}</span>
                {selected.bio && (
                  <p className="modal-description">{selected.bio}</p>
                )}
                <div className="project-tags">
                  {selected.skills?.map((skill) => (
                    <span className="tag" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {selected.isPlaceholder && (
              <p className="portfolio-preview-note">
                This is a sample portfolio. Team member details and project
                credits will be added soon.
              </p>
            )}
            <div className="portfolio-work-heading">
              <h3>
                {selected.isPlaceholder
                  ? "Portfolio previews"
                  : "Selected work"}
              </h3>
              <span>
                {selectedProjects.length.toString().padStart(2, "0")} PROJECTS
              </span>
            </div>
            <div className="portfolio-work-grid">
              {selectedProjects.map((project) => (
                <a
                  href="#project"
                  key={project.id}
                  onClick={close}
                  className="portfolio-work-card"
                  aria-label={`Explore ${project.title} in featured projects`}
                >
                  <ProjectPreview project={project} />
                  <div>
                    <span>{project.title}</span>
                    <ArrowUpRight size={16} />
                  </div>
                  <p>{project.category}</p>
                </a>
              ))}
            </div>
            {(selected.portfolioUrl || selected.githubUrl) && (
              <div className="modal-actions">
                {selected.portfolioUrl && (
                  <a
                    className="button button-primary"
                    href={selected.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Portfolio
                    <ArrowUpRight size={17} />
                  </a>
                )}
                {selected.githubUrl && (
                  <a
                    className="button button-secondary"
                    href={selected.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                    <Github size={17} />
                  </a>
                )}
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
