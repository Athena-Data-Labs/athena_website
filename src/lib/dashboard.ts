export const PRODUCTION_DASHBOARD_URL = "https://aegis.athenadatalabs.com";
export const PRODUCTION_DASHBOARD_OPEN_URL = "https://aegis.athenadatalabs.com";

function isTruthy(value?: string): boolean {
  if (!value) return false;
  return /^(1|true|yes|on)$/i.test(value.trim());
}

function isLocalhostUrl(url: URL): boolean {
  return url.hostname === "localhost" || url.hostname === "127.0.0.1";
}

export function resolveDashboardUrl(): string {
  const rawUrl = import.meta.env.VITE_DASHBOARD_URL?.trim();
  if (!rawUrl) return PRODUCTION_DASHBOARD_URL;

  try {
    const parsedUrl = new URL(rawUrl);
    const allowLocalDashboard = isTruthy(import.meta.env.VITE_ALLOW_LOCAL_DASHBOARD);

    if (isLocalhostUrl(parsedUrl) && !allowLocalDashboard) {
      return PRODUCTION_DASHBOARD_URL;
    }

    return parsedUrl.toString();
  } catch {
    return PRODUCTION_DASHBOARD_URL;
  }
}

export const DASHBOARD_URL = resolveDashboardUrl();

// Full-app links should remain stable during website QA, so they always target production.
export const DASHBOARD_OPEN_URL = PRODUCTION_DASHBOARD_OPEN_URL;