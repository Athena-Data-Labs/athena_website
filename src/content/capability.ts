import type { EntityProfile } from "./types";

/**
 * The company's federal contracting identity.
 *
 * Kept beside the certifications and for the same reason: these are the fields
 * a prime types into a bid, so they carry the same weight as the certification
 * itself and must exist in exactly one place. Every one of them is copied from
 * the registration of record rather than remembered.
 *
 * `naics` is deliberately empty until the codes are read off the SAM.gov
 * registration. An identifier rail that renders whatever it is given can never
 * show a code nobody verified, and a missing row is honest in a way that a
 * plausible guess would not be.
 */
export const entity: EntityProfile = {
  legalName: "Athena Analytics LLC",
  dba: "Athena Data Labs",
  uei: "X1U1K5TYHVU5",
  cage: "23SR2",
  naics: [],
  email: "info@athenadatalabs.com",
};
