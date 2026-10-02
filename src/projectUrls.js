export function getProjectUrl(project) {
  if (typeof project.url !== "string" || !project.url.trim()) return null;
  try {
    const url = new URL(project.url.trim());
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password
    ) {
      return null;
    }
    return url.href;
  } catch {
    return null;
  }
}
