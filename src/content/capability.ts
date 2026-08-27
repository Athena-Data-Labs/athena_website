import type { EntityProfile } from "./types";

/**
 * The company's federal contracting identity.
 *
 * Kept beside the certifications and for the same reason: these are the fields
 * a prime types into a bid, so they carry the same weight as the certification
 * itself and must exist in exactly one place.
 *
 * Every value is read from the SAM.gov entity registration rather than
 * remembered — legal name, UEI, CAGE, and the NAICS and PSC codes from the
 * Assertions section. `legalName` is SAM's form, punctuation included, because
 * the whole point of this block is that it matches the record a prime checks it
 * against, and it is the name as filed. Prose that only needs to name the
 * company, rather than identify it, says "Athena Analytics".
 *
 * Registration is Active, purpose "All Awards", public display on, and expires
 * 2027-08-05. Renewal is annual and lapsing deactivates the SBA certification's
 * public listing with it, so that date is the one to diary.
 */
export const entity: EntityProfile = {
  legalName: "Athena Analytics L.L.C.",
  dba: "Athena Data Labs",
  uei: "X1U1K5TYHVU5",
  cage: "23SR2",

  // Primary first, then by relevance rather than numerically: a reader scanning
  // for fit stops at the first line that matches, and 518210 sorting above the
  // 5415xx codes would bury the ones that describe most of the work.
  naics: [
    { code: "541512", label: "Computer Systems Design Services", primary: true },
    { code: "541511", label: "Custom Computer Programming Services" },
    { code: "541519", label: "Other Computer Related Services" },
    { code: "518210", label: "Computing Infrastructure, Data Processing, and Hosting" },
    { code: "541690", label: "Other Scientific and Technical Consulting Services" },
    { code: "541611", label: "Administrative and General Management Consulting" },
    { code: "541720", label: "Research and Development in the Social Sciences" },
  ],

  psc: [
    { code: "DA01", label: "IT — Business Application and Development Support" },
    { code: "DB02", label: "IT — Compute Support Services (Non-HPC)" },
    { code: "B544", label: "Special Studies and Analysis — Technology" },
    { code: "B599", label: "Special Studies and Analysis — Other" },
    { code: "R425", label: "Professional Support — Engineering and Technical" },
  ],

  email: "info@athenadatalabs.com",
};
