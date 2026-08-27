import type { Certification } from "./types";

/**
 * Federal certifications held by the company.
 *
 * This is the one claim on the site with legal weight behind it: willfully
 * misrepresenting certification status carries False Claims Act exposure, so
 * every field here is copied from the SBA approval letter rather than
 * paraphrased, and every surface that mentions a certification reads it from
 * here. The letter is filed at
 * 01_Formation/athena-analytics-l.l.c_ucp_approval_letter_appid_119481.pdf.
 *
 * Deliberately text, never SBA's digital icon. The letter permits the icon on a
 * business website but forbids it on "marketing materials or advertising", and
 * a studio's homepage is arguably both. Stating the fact in words is accurate
 * everywhere and needs no such judgement call.
 */
export const certifications: Certification[] = [
  {
    abbr: "SDVOSB",
    name: "Service-Disabled Veteran-Owned Small Business",
    issuer: "U.S. Small Business Administration",
    issuerShort: "SBA",
    date: "2026-08-27",
    dateLabel: "August 2026",
  },
  {
    abbr: "VOSB",
    name: "Veteran-Owned Small Business",
    issuer: "U.S. Small Business Administration",
    issuerShort: "SBA",
    date: "2026-08-27",
    dateLabel: "August 2026",
  },
];

/**
 * SBA's public certification search.
 *
 * Not a deep link to the profile: SBA creates it from the SAM.gov record and
 * says it appears within two business days of approval, so a direct URL could
 * 404 for anyone reading this in the first 48 hours. The search page is the
 * durable address, and it is the register itself rather than a claim about it.
 */
export const SBA_VERIFY_URL = "https://search.certifications.sba.gov/";

/** The headline credential, for the surfaces that only have room for one. */
export const primaryCertification = certifications[0];

/** "SDVOSB · VOSB", for compact rails. */
export const certificationAbbrs = certifications.map((c) => c.abbr).join(" · ");
