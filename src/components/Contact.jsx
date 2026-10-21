import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  Download,
  Facebook,
  Github,
  LoaderCircle,
  Linkedin,
  Twitter,
} from "lucide-react";
import { siteConfig } from "../config";
import { projectTypes, validateContact } from "../../shared/contact";
import { Modal, Reveal, SectionHeading } from "./UI";

export function SocialLinks({ contactHref = "#contact" }) {
  const [show, setShow] = useState(false);
  const close = useCallback(() => setShow(false), []);
  return (
    <>
      <div className="social-links">
        {[
          [Github, "GitHub", siteConfig.github],
          [Facebook, "Facebook", siteConfig.facebook],
          ...(siteConfig.twitter
            ? [[Twitter, "Twitter", siteConfig.twitter]]
            : []),
          ...(siteConfig.linkedin
            ? [[Linkedin, "LinkedIn", siteConfig.linkedin]]
            : []),
        ].map(([Icon, name, url]) =>
          url ? (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`NetCode on ${name}`}
            >
              <Icon size={18} />
            </a>
          ) : (
            <button
              key={name}
              aria-label={`${name} profile information`}
              onClick={() => setShow(true)}
            >
              <Icon size={18} />
            </button>
          ),
        )}
      </div>
      <AnimatePresence>
        {show && (
          <Modal title="Let's connect" onClose={close}>
            <p className="modal-description">
              Our social profiles are being updated. In the meantime, use the
              project form to tell us what you'd like to build.
            </p>
            <a
              className="button button-primary"
              href={contactHref}
              onClick={close}
            >
              Start a conversation
              <ArrowUpRight size={17} />
            </a>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}

const initialValues = {
  name: "",
  email: "",
  company: "",
  type: "",
  message: "",
  website: "",
};

export default function Contact() {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const formRef = useRef(null);
  const controller = useRef(null);
  useEffect(() => () => controller.current?.abort(), []);
  const close = useCallback(() => {
    controller.current?.abort("dialog-closed");
    setOpen(false);
    setSubmitting(false);
    setResult(null);
    setSubmitError("");
  }, []);
  const brief = `NetCode — Project Inquiry\n\nName: ${values.name.trim()}\nEmail: ${values.email.trim()}\nCompany: ${values.company.trim() || "Not provided"}\nProject type: ${values.type}\n\n${values.message.trim()}`;
  const change = (event) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    if (errors[name])
      setErrors((previous) => ({ ...previous, [name]: undefined }));
    setSubmitError("");
  };
  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const nextErrors = validateContact(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      formRef.current.elements[Object.keys(nextErrors)[0]]?.focus();
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    const request = new AbortController();
    controller.current = request;
    const timeout = setTimeout(() => request.abort(), 45000);
    try {
      const response = await fetch(siteConfig.contactEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(
          Object.fromEntries(
            Object.entries(values).map(([key, value]) => [key, value.trim()]),
          ),
        ),
        signal: request.signal,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || data?.ok !== true) {
        throw new Error(
          response.status === 429 ? "RATE_LIMITED" : "SEND_FAILED",
        );
      }
      if (!request.signal.aborted) {
        setResult("sent");
        setValues(initialValues);
      }
    } catch (error) {
      if (
        request.signal.reason !== "dialog-closed" &&
        controller.current === request
      ) {
        setSubmitError(
          error.message === "RATE_LIMITED"
            ? "Too many messages. Please try again later. Your details are still here."
            : request.signal.aborted
              ? "Sending is taking longer than expected. Your message may still arrive; please wait before retrying. Your details are still here."
              : "Your message could not be sent. Please try again, or save a copy of your brief. Your details are still here.",
        );
      }
    } finally {
      clearTimeout(timeout);
      if (controller.current === request) setSubmitting(false);
    }
  };
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([brief], { type: "text/plain;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "netcode-project-brief.txt";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const fieldProps = (name) => ({
    id: `contact-${name}`,
    name,
    value: values[name],
    onChange: change,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });
  const error = (name) =>
    errors[name] && (
      <span className="field-error" id={`${name}-error`}>
        {errors[name]}
      </span>
    );
  return (
    <section id="contact" className="section contact-section">
      <div className="contact-glow" aria-hidden="true" />
      <div className="container contact-cta">
        <SectionHeading
          title={
            <>
              Let's Build
              <br />
              Something <span className="accent-text">Great.</span>
            </>
          }
        >
          Have an idea for a website, application, or piso wifi? Let's transform
          your idea into a powerful digital solution.
        </SectionHeading>
        <Reveal className="inquire-action">
          <button
            type="button"
            className="button button-primary inquire-button"
            aria-haspopup="dialog"
            onClick={() => setOpen(true)}
          >
            Inquire Here!
            <ArrowUpRight size={20} />
          </button>
          <p className="inquire-note">
            Great things begin with a simple hello.
          </p>
        </Reveal>
      </div>
      <AnimatePresence>
        {open && (
          <Modal
            title={
              result ? "Thanks for reaching out." : "Tell us about your idea."
            }
            onClose={close}
            className="inquiry-modal"
            focusKey={result}
          >
            {!result ? (
              <form
                ref={formRef}
                onSubmit={submit}
                noValidate
                className="contact-form"
              >
                <p className="form-intro">
                  A few details are all we need to get started.
                </p>
                <div hidden aria-hidden="true">
                  <label htmlFor="contact-website">
                    Leave this field empty
                  </label>
                  <input
                    {...fieldProps("website")}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="contact-name">
                      Name <span>*</span>
                    </label>
                    <input
                      {...fieldProps("name")}
                      placeholder="Your name"
                      autoComplete="name"
                      required
                      maxLength={100}
                    />
                    {error("name")}
                  </div>
                  <div className="field">
                    <label htmlFor="contact-email">
                      Email <span>*</span>
                    </label>
                    <input
                      {...fieldProps("email")}
                      type="email"
                      placeholder="your@email.com"
                      autoComplete="email"
                      required
                      maxLength={254}
                    />
                    {error("email")}
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="contact-company">
                    Company / Organization{" "}
                    <span className="optional">(optional)</span>
                  </label>
                  <input
                    {...fieldProps("company")}
                    placeholder="Where you make things happen"
                    autoComplete="organization"
                    maxLength={150}
                  />
                  {error("company")}
                </div>
                <div className="field">
                  <label htmlFor="contact-type">
                    Project Type <span>*</span>
                  </label>
                  <select {...fieldProps("type")} required>
                    <option value="" disabled>
                      Select a project type
                    </option>
                    {projectTypes.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                  {error("type")}
                </div>
                <div className="field">
                  <label htmlFor="contact-message">
                    Message <span>*</span>
                  </label>
                  <textarea
                    {...fieldProps("message")}
                    placeholder="What's on your mind? Tell us a little about your project, goals, and ideas…"
                    rows={4}
                    required
                    maxLength={5000}
                  />
                  {error("message")}
                </div>
                {submitError && (
                  <div className="submit-error" role="alert">
                    {submitError}
                    <button type="button" onClick={download}>
                      Save your brief
                      <Download size={15} />
                    </button>
                  </div>
                )}
                <button
                  className="button button-primary submit-button"
                  disabled={submitting}
                  type="submit"
                >
                  {submitting ? (
                    <>
                      Sending
                      <LoaderCircle className="spin" size={18} />
                    </>
                  ) : (
                    <>
                      Send Message
                      <ArrowUpRight size={18} />
                    </>
                  )}
                </button>
                <p className="form-privacy">
                  Your details are used only to respond to your inquiry.
                </p>
              </form>
            ) : (
              <>
                <div className="detail-icon">
                  <Check size={28} />
                </div>
                <p className="modal-description">
                  Your message has been sent. We're looking forward to learning
                  more about your idea.
                </p>
              </>
            )}
          </Modal>
        )}
      </AnimatePresence>
    </section>
  );
}
