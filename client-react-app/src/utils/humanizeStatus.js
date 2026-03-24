/**
 * Display API status strings without underscores (e.g. peer_review → peer review).
 */
export function humanizeStatus(status) {
  if (status == null || status === "") return "";
  return String(status).replace(/_/g, " ");
}
