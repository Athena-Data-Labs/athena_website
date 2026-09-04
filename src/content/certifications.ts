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
 * Our entry in SBA's public certification register.
 *
 * This used to point at the bare search page, because SBA builds the profile
 * from the SAM.gov record and only publishes it a couple of business days
 * after approval — a deep link would have 404'd for anyone reading in that
 * window. The profile is live now, so it is the better address: it is still
 * the register itself rather than a claim about it, and it drops the step
 * where a contracting officer has to retype the company name to find us.
 */
export const SBA_VERIFY_URL =
  "https://search.certifications.sba.gov/profile/X1U1K5TYHVU5/23SR2?page=1";

/** The headline credential, for the surfaces that only have room for one. */
export const primaryCertification = certifications[0];

/** "SDVOSB · VOSB", for compact rails. */
export const certificationAbbrs = certifications.map((c) => c.abbr).join(" · ");
