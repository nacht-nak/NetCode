import { useCallback, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ExternalLink,
  Search,
} from "lucide-react";
import { projects } from "../data";
import { Modal, Reveal, SectionHeading } from "./UI";
import ProjectPreview from "./ProjectPreview";
import { getProjectUrl } from "../projectUrls";

const featuredProjects = projects
  .filter((project) => project.featured !== false)
  .slice(0, 4);
const PAGE_SIZE = 12;

function LiveProject({ project }) {
  const url = getProjectUrl(project);
  return (
    <div className="live-project">
      <div className="live-project-toolbar">
        <span>{new URL(url).hostname}</span>
        <a
          className="button button-primary"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open website <ExternalLink size={16} />
        </a>
      </div>
      <ProjectPreview project={project} interactive />
      <p className="live-project-note">
        Preview not loading? Open the website in a new tab.
      </p>
    </div>
  );
}

function ProjectDemo({ project }) {
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState([]);
  const items =
    project.id === "learnly"
      ? [
          "React Fundamentals",
          "Designing Better Interfaces",
          "Python for Beginners",
          "Database Essentials",
        ]
      : project.id === "forma"
        ? [
            "The Courtyard House",
            "Coastal Residence",
            "Studio No. 04",
            "The Garden Pavilion",
          ]
        : project.id === "commerce"
          ? [
              "Studio Headphones",
              "Desk Lamp",
              "Mechanical Keyboard",
              "Everyday Backpack",
            ]
          : [
              "Website launch",
              "Customer onboarding",
              "Monthly reporting",
              "Product updates",
            ];
  return (
    <div className="interactive-demo">
      <div className="demo-heading">
        <span className="demo-brand">
          <span className="demo-brand-icon">{project.title[0]}</span>
          {project.title}
        </span>
        <span className="tag">Interactive concept</span>
      </div>
      <h3>
        {project.id === "learnly"
          ? "Your next chapter starts here."
          : project.id === "forma"
            ? "Spaces with a story."
            : project.id === "commerce"
              ? "Your catalog, at a glance."
              : "Welcome to your workspace."}
      </h3>
      <p>
        Explore this local prototype: search the collection and save your
        favorites.
      </p>
      <label className="demo-search">
        <Search size={18} />
        <input
          aria-label="Search demo collection"
          placeholder="Search the collection…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <div className="demo-items">
        {items
          .filter((item) => item.toLowerCase().includes(query.toLowerCase()))
          .map((item, i) => (
            <div className="demo-item" key={item}>
              <span className={`demo-item-art art-${i}`}>
                {String(items.indexOf(item) + 1).padStart(2, "0")}
              </span>
              <div>
                <h4>{item}</h4>
                <span>
                  {project.id === "learnly"
                    ? "Self-paced learning"
                    : project.id === "forma"
                      ? "Selected architecture"
                      : project.id === "commerce"
                        ? "Available in your catalog"
                        : "Ready to get started"}
                </span>
              </div>
              <button
                className={`demo-save ${saved.includes(item) ? "saved" : ""}`}
                aria-pressed={saved.includes(item)}
                onClick={() =>
                  setSaved(
                    saved.includes(item)
                      ? saved.filter((value) => value !== item)
                      : [...saved, item],
                  )
                }
              >
                {saved.includes(item) ? (
                  <>
                    <Check size={14} />
                    Saved
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          ))}
      </div>
      {!items.some((item) =>
        item.toLowerCase().includes(query.toLowerCase()),
      ) && (
        <div className="demo-empty">No results. Try a different search.</div>
      )}
      <p className="demo-saved" role="status">
        {saved.length} {saved.length === 1 ? "item" : "items"} saved in this
        preview.
      </p>
    </div>
  );
}

export default function Projects({ allProjects = false }) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [demo, setDemo] = useState(false);
  const reduced = useReducedMotion();
  const close = useCallback(() => {
    setSelected(null);
    setDemo(false);
  }, []);
  const openProject = (project, showDemo = false) => {
    setSelected(project);
    setDemo(showDemo);
  };
  const collection = allProjects ? projects : featuredProjects;
  const filters = [
    "All",
    ...new Set(collection.map((project) => project.category)),
  ];
  const search = query.trim().toLowerCase();
  const matchingProjects = collection.filter(
    (project) =>
      (filter === "All" || project.category === filter) &&
      (!search ||
        [project.title, project.subtitle, project.category, ...project.tags]
          .join(" ")
          .toLowerCase()
          .includes(search)),
  );
  const pageCount = Math.max(1, Math.ceil(matchingProjects.length / PAGE_SIZE));
  const visibleProjects = allProjects
    ? matchingProjects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : matchingProjects;
  const resetFilters = () => {
    setQuery("");
    setFilter("All");
    setPage(1);
  };
  const changePage = (nextPage) => {
    setPage(nextPage);
    document.getElementById("project-results")?.scrollIntoView({
      behavior: reduced ? "instant" : "smooth",
      block: "start",
    });
  };
  return (
    <section
      id="project"
      className={`section projects-section ${allProjects ? "all-projects-section" : ""}`}
    >
      <div className="container">
        {allProjects ? (
          <Reveal className="project-gallery-heading">
            <div className="eyebrow">OUR PROJECT COLLECTION</div>
            <h1>
              All Projects<span className="accent-period">.</span>
            </h1>
            <p>
              Explore the websites, applications, and systems we're building.
              Find a project by service or technology, and take a closer look.
            </p>
            <span className="project-collection-count">
              {projects.length} {projects.length === 1 ? "project" : "projects"}{" "}
              & counting
            </span>
          </Reveal>
        ) : (
          <div className="section-top">
            <SectionHeading
              number="02"
              label="SELECTED WORK"
              title={
                <>
                  Featured Projects<span className="accent-period">.</span>
                  <br />
                  <span className="muted-heading">Built with purpose.</span>
                </>
              }
            >
              Some solutions crafted with technology, creativity, and purpose.
            </SectionHeading>
            <Reveal className="section-side-note">
              <span className="small-section-title">Featured Projects</span>A
              selection of live systems and concept projects.
            </Reveal>
          </div>
        )}
        {allProjects && (
          <label className="project-search">
            <Search size={20} aria-hidden="true" />
            <input
              type="search"
              aria-label="Search projects"
              placeholder="Search by name, service, or technology"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </label>
        )}
        <Reveal
          className="project-filters"
          role="group"
          aria-label="Filter projects"
        >
          {filters.map((item) => (
            <button
              key={item}
              className={filter === item ? "filter active" : "filter"}
              aria-pressed={filter === item}
              onClick={() => {
                setFilter(item);
                setPage(1);
              }}
            >
              {item}
              {item === "All" && (
                <span>{String(collection.length).padStart(2, "0")}</span>
              )}
            </button>
          ))}
        </Reveal>
        {allProjects && (
          <div id="project-results" className="project-results">
            <p role="status" aria-live="polite">
              {matchingProjects.length === 0
                ? "No projects found"
                : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, matchingProjects.length)} of ${matchingProjects.length} ${matchingProjects.length === 1 ? "project" : "projects"}`}
            </p>
            {(query || filter !== "All") && (
              <button className="arrow-link" onClick={resetFilters}>
                Clear filters
              </button>
            )}
          </div>
        )}
        <motion.div className="project-grid" layout={!reduced}>
          <AnimatePresence mode="popLayout">
            {visibleProjects.map((project) => (
              <motion.article
                key={project.id}
                className="project-card"
                layout={!reduced}
                initial={reduced ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: reduced ? 0 : 0.3 }}
              >
                <div className={`project-image-wrap ${project.color}`}>
                  <ProjectPreview project={project} />
                  <div className="project-image-overlay">
                    <button
                      className="button button-light"
                      onClick={() => openProject(project)}
                    >
                      View Project
                      <ArrowUpRight size={17} />
                    </button>
                    <button
                      className="button demo-button"
                      onClick={() => openProject(project, true)}
                    >
                      Live Demo
                      <ExternalLink size={15} />
                    </button>
                  </div>
                </div>
                <div className="project-details">
                  <div>
                    <span className="project-category">{project.category}</span>
                    <h3>
                      <button onClick={() => openProject(project)}>
                        {project.title}
                      </button>
                    </h3>
                    <p>{project.subtitle}</p>
                  </div>
                  <button
                    className="project-arrow"
                    aria-label={`View ${project.title}`}
                    onClick={() => openProject(project)}
                  >
                    <ArrowUpRight size={22} />
                  </button>
                </div>
                <div className="project-tags">
                  {project.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                {getProjectUrl(project) && (
                  <a
                    className="arrow-link project-website-link"
                    href={getProjectUrl(project)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${project.title} website`}
                  >
                    Open website <ExternalLink size={16} />
                  </a>
                )}
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
        {allProjects && matchingProjects.length === 0 && (
          <div className="project-gallery-empty">
            <Search size={32} aria-hidden="true" />
            <h2>No matching projects.</h2>
            <p>Try a different search or explore another category.</p>
            <button className="button button-secondary" onClick={resetFilters}>
              Show all projects
            </button>
          </div>
        )}
        {allProjects && pageCount > 1 && (
          <nav className="project-pagination" aria-label="Project pages">
            <button
              className="button button-secondary"
              disabled={page === 1}
              onClick={() => changePage(page - 1)}
            >
              <ArrowLeft size={16} /> Previous
            </button>
            <span>
              Page {page} of {pageCount}
            </span>
            <button
              className="button button-secondary"
              disabled={page === pageCount}
              onClick={() => changePage(page + 1)}
            >
              Next <ArrowRight size={16} />
            </button>
          </nav>
        )}
        {!allProjects && (
          <Reveal className="view-all-projects">
            <a className="button button-primary" href="./projects.html">
              View All Projects <ArrowRight size={18} />
            </a>
            <p>
              Explore our complete collection of {projects.length}{" "}
              {projects.length === 1 ? "project" : "projects"}.
            </p>
          </Reveal>
        )}
        <Reveal className="project-closing">
          <span>Have something different in mind? We'd love to hear it.</span>
          <a
            className="arrow-link"
            href={allProjects ? "./index.html#contact" : "#contact"}
          >
            Let's build your idea
            <ArrowUpRight size={16} />
          </a>
        </Reveal>
      </div>
      <AnimatePresence>
        {selected && (
          <Modal
            title={demo ? `${selected.title} — Live Demo` : selected.title}
            onClose={close}
            className={`project-modal ${demo && getProjectUrl(selected) ? "live-project-modal" : ""}`}
            focusKey={demo}
          >
            {demo ? (
              getProjectUrl(selected) ? (
                <LiveProject project={selected} />
              ) : (
                <ProjectDemo project={selected} />
              )
            ) : (
              <>
                <ProjectPreview project={selected} />
                <div className="modal-project-info">
                  <span className="project-category">
                    {selected.category} ·{" "}
                    {getProjectUrl(selected)
                      ? "Live website"
                      : "Concept project"}
                  </span>
                  <p className="modal-description">{selected.description}</p>
                  <div className="project-tags">
                    {selected.tags.map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <ul className="feature-list">
                    {selected.features.map((feature) => (
                      <li key={feature}>
                        <Check size={16} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    className="button button-primary"
                    onClick={() => setDemo(true)}
                  >
                    Explore Live Demo
                    <ExternalLink size={16} />
                  </button>
                </div>
              </>
            )}
          </Modal>
        )}
      </AnimatePresence>
    </section>
  );
}
