import type { FieldNote } from "./types";

export const fieldNotes: FieldNote[] = [
  {
    slug: "prerendering-spa-open-graph-amplify",
    title: "Every Shared Link Showed the Homepage: Prerendering a React SPA on Amplify",
    summary:
      "The per-route metadata was already correct and Google could see it. Every link posted to LinkedIn or Facebook still showed the homepage, because the crawlers that decide what a shared link looks like never run JavaScript. Fixing it meant finding a canonical tag that told Google all 31 pages were duplicates, and a hosting rule that made the obvious fix impossible.",
    seoDescription:
      "Prerendering a Vite React SPA on AWS Amplify: a canonical pointing every route at the homepage, a 200 rewrite that silently defeats prerendering, and the trailing-slash trap.",
    keywords: [
      "prerendering",
      "Open Graph",
      "AWS Amplify",
      "canonical URL",
      "React SPA SEO",
      "social sharing",
    ],
    date: "2026-08-14",
    readingTimeMinutes: 7,
    categories: ["Web Engineering", "SEO"],
    tags: ["Open Graph", "Prerendering", "AWS Amplify", "Canonical URLs", "React", "Social Sharing"],
    overview: [
      "This is the third note in a series about making a client-rendered site visible, and the first one where the architecture was not the problem. Per-route metadata worked. The sitemap generated itself from the same content that drove the routes. Every page had its own Open Graph image, generated at build time. And every link anyone shared still previewed as the homepage.",
      "The gap was not what we had built. It was who was reading it.",
    ],
    sections: [
      {
        heading: "Problem",
        paragraphs: [
          "Google runs JavaScript. It renders the page, waits for the DOM to settle, and reads the metadata our Seo component sets on mount. That is why the earlier work paid off in search: per-route titles and descriptions were reaching the index.",
          "Facebook, LinkedIn, Slack and X do not run JavaScript. They fetch the URL once, read the raw HTML, and take whatever Open Graph tags are in it. For a single-page application every URL serves the same index.html, so every one of them returned the homepage title, the homepage description, and the homepage image.",
          "The practical cost was specific: the build was already generating a distinct share image for every product, service, case study and field note, and not one of those images was reachable by the only clients that would ever have used them. A link to a product page and a link to the front door were indistinguishable in a feed.",
        ],
      },
      {
        heading: "The tag that was quietly worse",
        paragraphs: [
          "Reading the served HTML turned up something more damaging than a stale share image. index.html carried a hardcoded canonical:",
          "<link rel=\"canonical\" href=\"https://athenadatalabs.com/\" />",
          "That is correct for the homepage and false everywhere else. Because the SPA rewrite serves that one file at every URL, all 31 routes in the sitemap were declaring themselves canonical to the homepage. A canonical tag is not a hint about layout; it is a page stating which URL should be indexed in its place. We were telling Google, in the strongest terms available, that every page on the site was a duplicate of the front door.",
          "The client-side component did set the correct canonical afterwards, which is presumably why it had gone unnoticed. But a wrong canonical in the served HTML is worse than no canonical at all: absent, every URL self-references by default, which is exactly what we wanted.",
        ],
      },
      {
        heading: "Challenge",
        paragraphs: [
          "Removing the bad canonical took one line. Getting real per-route HTML in front of a crawler was the actual work, and the first attempt was already written before we checked whether it could ever be served.",
          "Amplify's default single-page-application rule rewrites any extensionless path to /index.html with status 200. A 200 rewrite matches before static file resolution, so a prerendered /about/index.html sitting in the deployment would never be reached. The rule that makes an SPA work is the same rule that makes prerendering pointless, and nothing about the build output would have revealed it. That came from reading the app's rewrite configuration, not from testing the build.",
          "The second constraint was maintenance. The straightforward way to prerender is to write a table of titles and descriptions for every route. That table is a second copy of text that already lives in the page components, and a second copy drifts. Within a couple of months the shared preview and the rendered page disagree, and nobody notices because nobody looks at both.",
        ],
      },
      {
        heading: "Solution",
        paragraphs: [
          "A post-build step writes a real HTML file per route into dist/, each with its own title, description, canonical and Open Graph tags baked into the markup. It restates nothing:",
        ],
        bullets: [
          "Static routes are read back out of the <Seo /> blocks already present in the page components, so the served HTML and the rendered page are sourced from the same string.",
          "Dynamic routes are rebuilt from the content modules using the same expressions the detail pages use, reusing the esbuild trick the sitemap generator already relied on to import TypeScript data under Node.",
          "The Amplify rewrite changed from 200 to 404-200, so existing files win and the fallback only covers genuine misses.",
        ],
        closingParagraphs: [
          "It fails the build rather than guessing. An unparseable metadata block, or any disagreement between the routes it found and the routes in the generated sitemap, stops the build with a non-zero exit. A silently skipped route would serve homepage metadata again, which is the exact defect being fixed, so the failure mode had to be loud. We verified that by injecting a route the script could not resolve and confirming the build died.",
        ],
      },
      {
        heading: "The bug that only existed in production",
        paragraphs: [
          "The first deployment worked, and testing it against the live site immediately turned up something the build output could not have shown.",
          "With per-route files in place, Amplify resolves /about to about/index.html and issues a 301 to /about/. The sitemap and the freshly baked canonical still named the slashless form. So the sequence was: Google reads the sitemap, requests /about, gets redirected to /about/, and lands on a page whose canonical tag points back at /about, which redirects away again.",
          "That is a self-contradicting signal, and it would have been invisible in any local check, because locally the files are just files. The fix was to normalise everything onto the form the host actually serves: the sitemap, the prerendered canonical and og:url, and the client-side component, so the static and JavaScript-rendered canonicals agree instead of overwriting each other with different answers.",
        ],
      },
      {
        heading: "Technical Implementation",
        paragraphs: [
          "The whole thing is one Node script and a hosting setting. Details that mattered more than they should have:",
        ],
        bullets: [
          "The script runs as a postbuild hook. pnpm does not run pre and post scripts by default, so this depends on enable-pre-post-scripts being set in .npmrc — without it the step is skipped in CI and nothing warns you.",
          "Open Graph image paths are checked against the build output before being written. A tag pointing at a missing file is worse than the default image, because the scraper shows nothing at all.",
          "Route identity is compared without trailing slashes, so the slash is a presentation detail of the emitted URL rather than something two parts of the build can disagree about.",
          "The 404 page is excluded from prerendering by its own noindex flag rather than by a hardcoded exception.",
        ],
      },
      {
        heading: "Verifying it, including the warning to ignore",
        paragraphs: [
          "Search Console is the wrong tool here, because the problem was never Google. The tools that answer this question are Facebook's Sharing Debugger and LinkedIn's Post Inspector: both fetch the URL the way a scraper does and show exactly what a shared link will look like. Both also cache aggressively, so an old scrape will keep showing the old preview until you force a re-fetch.",
          "The Sharing Debugger reports one warning on a correctly configured page: fb:app_id is missing, under a heading that says it should be fixed. It is safe to leave. That property existed to attribute shares to a Facebook App for Domain Insights, and Domain Insights was retired years ago. Link previews render entirely from og:title, og:description and og:image. Adding an invented app ID to silence a warning is worse than the warning.",
          "We also checked the things a change like this can quietly break: static assets, the sitemap, robots.txt, the JavaScript bundle, and client-side navigation after a deep link.",
        ],
      },
      {
        heading: "Results",
        paragraphs: [
          "All 31 routes now serve their own title and a canonical that points at themselves, verified against the live site rather than the build directory. Share previews resolve per route, with the per-route image that had been generated and unreachable for months.",
          "One improvement was unplanned. The old catch-all returned HTTP 200 for any path that did not exist, which makes every typo a soft 404 that Google is entitled to index. Unknown paths now return a genuine 404 with the application shell, so the styled not-found page still renders for a human while search engines get the correct answer.",
        ],
      },
      {
        heading: "Lessons Learned",
        paragraphs: [
          "A wrong canonical is worse than a missing one. Absent, a page self-references, which is right almost every time. Present and pointing somewhere else, it is a page arguing against its own existence.",
          "Read the hosting configuration before designing around it. A rewrite rule that matches before static resolution silently defeats prerendering, and the build output looks identical either way. Half a day of work was already written against an assumption that one API call disproved.",
          "Derive metadata, never restate it. Any value copied into a second place is a value that will eventually disagree with the first, and share previews are exactly the surface nobody re-checks.",
          "Test against the deployment. The trailing-slash contradiction did not exist in the build output, in the local preview, or in any file we could inspect. It existed only in how the host resolved a directory, and the only way to find it was to ask the live site.",
        ],
      },
    ],
    relatedFieldNoteSlugs: ["react-spa-seo-best-practices", "search-console-indexing-fix"],
    relatedProductSlugs: [],
    relatedServiceSlugs: [],
  },
  {
    slug: "aws-account-per-app-migration",
    title: "Rebuilding the Infrastructure: One Cluttered AWS Account Into Four",
    summary:
      "Two live products shared one AWS account, three deployment systems, and a single disk. Over four days we rebuilt it into an account per app without taking either product down, plus the two near-misses that came closest to making that sentence untrue.",
    seoDescription:
      "An honest AWS post-mortem: one account split into four, Beanstalk and Amplify replaced with Docker and Caddy, an outage, and a near-miss with live subscriptions.",
    keywords: [
      "AWS multi-account strategy",
      "Elastic Beanstalk migration",
      "AWS Amplify alternative",
      "Caddy HTTPS",
      "Cognito user pool migration",
      "infrastructure post-mortem",
      "zero downtime migration",
      "data integrity migration",
    ],
    date: "2026-07-27",
    readingTimeMinutes: 16,
    categories: ["Infrastructure", "AWS"],
    tags: ["AWS", "Migration", "Docker", "Caddy", "Cognito", "Post-Mortem"],
    overview: [
      "One AWS account held everything we run: two production apps with paying users, a marketing site, the login system, all the data, and years of abandoned experiments. Nothing was broken. But there was no line anywhere, one mistake could take out both products, and the only way to know what was running was to remember.",
      "Over four days in July 2026 we rebuilt it: one account per app, plain servers running Docker instead of two managed platforms, one deploy command instead of three systems, and no load balancers at all. Cost fell by roughly $55 to $65 a month.",
      "There was one real outage, and one near-miss that could have silently detached paying customers from their subscriptions. Both are covered in full below, along with an architectural decision we made under time pressure on a premise that one command would have disproved.",
    ],
    sections: [
      {
        heading: "Where it started",
        paragraphs: [
          "Everything lived in one account, and each piece had arrived by a different route at a different time. None of it was wrong on its own. Together it meant there was no boundary anywhere.",
        ],
        bullets: [
          "Both app backends ran on Elastic Beanstalk, each dragging along a load balancer neither app needed.",
          "One product's marketing site ran on AWS Amplify, a second and completely different deployment system.",
          "Deploys ran through GitHub Actions: slow, plus a permanent admin door from GitHub into AWS.",
          "Both apps shared one disk, so either could corrupt the other's data.",
        ],
        closingParagraphs: [
          "The real cost was not money. It was that the blast radius of any mistake was the whole company, and nobody could answer \"what is running right now?\" from anything but memory.",
        ],
      },
      {
        heading: "The four decisions",
        paragraphs: ["Four choices set the shape of everything that followed. Three of them held. One did not."],
        bulletGroups: [
          {
            title: "One account per app",
            bullets: [
              "Each app gets a sealed box; the shared account keeps only what both genuinely need.",
              "Accounts are free. The only cost is remembering to switch between them.",
            ],
          },
          {
            title: "Plain servers with Docker, not a platform",
            bullets: [
              "Elastic Beanstalk and Amplify hide a lot, which is pleasant until something breaks and the hidden parts are exactly what you need to see.",
              "One small server running Docker, with Caddy handling HTTPS, fits in one person's head.",
              "Caddy also issues free certificates automatically, which removed the load balancer and the certificate service in a single move.",
            ],
          },
          {
            title: "The login system stays put: a decision made on a false premise",
            bullets: [
              "The reasoning at the time: passwords cannot be exported from AWS Cognito. Not \"it's hard\": the API does not exist, because passwords are stored one-way by design. Moving the pool would force every user to reset their password, so it stayed in the shared account behind a narrow cross-account door.",
              "That reasoning was wrong, and nobody checked it. Every single account in that pool signs in with Google or Apple. Not one of them has a password. There was nothing to reset.",
              "The decision was made under time pressure from a general fact about Cognito, without spending the sixty seconds it would have taken to list the users and see that the general fact did not apply.",
              "It cost real money: the cross-account door it justified went on to cause the only user-facing outage of the whole project. The pool was moved properly two days later.",
            ],
          },
          {
            title: "Deploy by leaving a file in S3",
            bullets: [
              "No SSH port and no key file: the laptop uploads a zip to S3 and tells the server to fetch it.",
              "Access is controlled by permissions instead of a secret, and every session is logged.",
            ],
          },
        ],
      },
      {
        heading: "How the switch happened",
        paragraphs: [
          "The whole plan rested on one idea: build the new thing completely, verify it, then move the domain name. DNS is the only switch that has to flip, and it flips back.",
        ],
        bullets: [
          "Build and verify the new server while the old one keeps serving every real user.",
          "Copy the data across twice: once early, once at the last moment to catch anything written in between.",
          "Point the domain at the new address, with the refresh interval set to 60 seconds beforehand so the world follows within a minute.",
          "Leave the old stack running for days. Rolling back is one DNS change.",
          "Only then delete anything, and only after both apps were confirmed working normally.",
        ],
        closingParagraphs: [
          "The test that mattered most came before the deletions: both databases were compared row by row: 2,617 events, 475 users, all seven billing tables identical. Deleting production data on the assumption that a copy worked is how people lose companies.",
        ],
      },
      {
        heading: "Five things that went wrong",
        paragraphs: ["The honest part, and the most useful one."],
        bulletGroups: [
          {
            title: "1. The certificate quietly went fake",
            bullets: [
              "Caddy tries to obtain an HTTPS certificate the moment it starts. During testing it started several times while the domain still pointed at the old server, so every attempt failed.",
              "After enough failures Let's Encrypt makes you wait, and Caddy did exactly what it is designed to do: switched to a staging certificate service, whose certificates browsers reject.",
              "Fix: after DNS moved, clear Caddy's saved certificate state and restart. A real certificate was issued on the first try.",
              "Lesson: point DNS at the new server before starting Caddy for the first time.",
            ],
          },
          {
            title: "2. The old environments refused to delete",
            bullets: [
              "Deleting the old setup failed twice with \"resource has a dependent object\", after ten minutes of waiting each time.",
              "The cause was a knot: the old shared disk was attached to a firewall group being deleted, and the two apps' firewall groups referenced each other. Nothing could be removed because everything was holding something else.",
              "Fix: move the disk to a different firewall group, cut the two cross-references, then delete in the right order. Both completed in about 40 seconds.",
              "Lesson: \"dependent object\" almost always means another firewall rule points at this one. Look for who references it, not what is inside it.",
            ],
          },
          {
            title: "3. Logins broke, and the error blamed the wrong account",
            bullets: [
              "The one that reached real users. After the move, signing in failed with a message saying the login pool did not exist in the app's own account. It was never there: it lives in the shared account.",
              "AWS builds that message from who is asking, not from where the thing actually lives, so the error points somewhere false and sends you hunting for a pool that never existed.",
              "The real cause: the code had four separate places that connect to the login system, and the migration converted only one. The other three still connected the old way and were denied, breaking Apple sign-in, account deletion, and Apple's \"user revoked access\" notifications, which would have failed silently.",
              "Fix: one shared function is now the only way to build a login connection.",
              "Lesson: after moving anything across an account boundary, find every call site, then check the permission list against every operation the code performs, not just the one you happened to test.",
            ],
          },
          {
            title: "4. The tests were lying",
            bullets: [
              "Found while fixing the above. A test already existed asserting that a failed account deletion raises a clear error, and it passed while the real thing was broken.",
              "The new shared function caches its connection. The first test's fake connection was cached and handed to every later test, so the second test never exercised what it claimed to.",
              "Lesson: a passing test that shares hidden state with an earlier test is not a passing test. Caching is usually the culprit.",
            ],
          },
          {
            title: "5. Two safety settings were silently off",
            bullets: [
              "Automatic backups were off on both new data disks. They are on by default from the web console and off from the command line, so the move had quietly lost backup coverage the old setup had.",
              "The old nightly data export was still running against the dead server, writing to the same place as the new one. Whichever finished last won, so good data could have been overwritten with stale data indefinitely, with no error anywhere.",
              "Lesson: check the defaults of whichever tool you used. The console and the command line disagree, and the command line is quieter.",
            ],
          },
        ],
      },
      {
        heading: "Round two: moving the login system",
        paragraphs: [
          "Two days later the decision to leave the login system in the shared account got revisited, and the premise it rested on collapsed on first contact with the data. Of the accounts in that pool, 21 sign in with Apple and 5 with Google. Zero use an email and password. The blocker had never existed, and one command would have shown that at the time.",
          "What actually made the move hard was not the users. It was the iPhone app. It ships its web code compiled inside the binary, and the login system's address is compiled in with it. Changing that needs an App Store release, and the app and the server have to switch together: an old app against a new server fails, and a new app against an old server fails too. There is no ordering that avoids a window.",
          "So the work was staged: build the new pool alongside the old and prove it, then bundle the switch into a release that was already going out. The pool was configured to be byte-identical to the original (settings, app client, both providers) and verified by diffing the two rather than by eye.",
        ],
        bulletGroups: [
          {
            title: "The part that nearly went badly",
            bullets: [
              "Every user's internal account ID is derived by hashing their login ID. A separate table exists precisely to survive that: it maps a login to its original account ID, so a new login system does not orphan anyone.",
              "That table had been silently destroyed on every single deploy for months. The setting naming its location was never configured, so it defaulted to a path inside the container, which is rebuilt each time. Its two sibling databases, billing and analytics, were both configured correctly. Only this one was missed.",
              "It had never mattered, because the hash is deterministic: with a fixed login system, the same account ID regenerated after every wipe. The migration turned a dormant bug into a live one. New login system, new login IDs, new hashes, so the first people to sign in after the switch were quietly issued brand-new accounts, disconnected from their own billing and history.",
              "It was caught by asking a question that could have been skipped: the sign-ins work, but did those people get their original accounts back? The answer was no. Overlap between live accounts and billing records: zero.",
            ],
          },
        ],
        closingParagraphs: [
          "The honest version: nothing was lost, and that was luck rather than design. The handful of people who happened to sign in first had no billing records; the ones who did had not yet opened the app. Had the order been reversed, the first sign-in would have silently detached a paying customer from their subscription. No error, no alert, nothing to notice until someone complained. The margin between a clean migration and a data-integrity incident was who opened their phone first.",
          "The repair: rebuild the mapping table from the old system's data, deriving each person's original account ID and pairing it with the login name, which is stable across both systems. Write it to the persistent disk, then point the setting at it so it can never be wiped again. Verified afterwards by proving that every billing record which had ever been reachable from a login was reachable again.",
          "The lesson is the one worth carrying out of this whole project: verifying that a migration works is not the same as verifying it preserved anything. Sign-in succeeded for every test user while the data behind it was being detached.",
        ],
      },
      {
        heading: "Where it landed",
        paragraphs: ["Four days of work, measured against what was there before."],
        bullets: [
          "Accounts: from 1 holding everything, to 3 in use and 1 reserved.",
          "Login system: from the shared account behind a cross-account door, to inside the app's own account with no door at all.",
          "Load balancers: from 2 to 0.",
          "Deployment systems: from 3 to 1, a single make deploy.",
          "HTTPS certificates: from paid and tied to load balancers, to free and renewed automatically.",
          "GitHub's access to AWS: from a permanent admin door to none.",
          "App data: from one shared disk to separate disks per app, with backups on.",
          "Signing in: from one account and switching roles by hand, to one portal covering all four.",
          "Cost: roughly $55 to $65 per month lower.",
        ],
        closingParagraphs: [
          "Once the old stack was gone, so was a long tail nobody had looked at in a year: 219 stored application versions, a 665 MB bucket of old deploy files, a 224 MB container registry from an abandoned experiment, eleven empty log folders, four orphaned firewall groups, three certificates for things that no longer existed, and a DNS zone for a dead side project.",
          "Then the tidying: a single sign-in portal covering all four accounts with an authenticator app, billing and security notices pointed at a monitored address, and settings templates added to both repositories. One had none at all, so 43 production settings were undocumented. Neither repository has ever contained a real secret.",
        ],
      },
      {
        heading: "Lessons",
        paragraphs: ["What we would tell anyone doing this at a similar size."],
        bullets: [
          "Move the domain name last. Build in parallel, verify, then flip DNS. One switch, and it flips back.",
          "Compare the data before deleting the source. Row counts, not optimism.",
          "Keep the old thing running for days. A few extra dollars beats having no way back.",
          "Read AWS permission errors carefully. They name the caller's account, not the resource's. That one detail cost the most time here.",
          "After crossing an account boundary, find every call site. One converted path proves nothing about the others.",
          "Check what your tool defaulted to. The console and the command line disagree, quietly.",
          "Check the premise before you design around it. A whole architectural compromise, and the outage it caused, rested on a constraint that one command would have disproved.",
          "\"It works\" is not \"it preserved the data.\" Every test sign-in succeeded while the accounts behind them were being silently detached. Verify continuity, not just success.",
          "Find the storage nobody configured. Two of three databases were explicitly placed on permanent disk. The third defaulted onto disposable disk and was destroyed on every deploy for months without a single symptom.",
          "Simple beats managed at this size. A platform saves work at scale and hides things you need at small scale.",
        ],
        closingParagraphs: [
          "The shape now: one organization, one account per app, one small server each, one deploy command, one shared place for data, one portal to sign in. Adding a third app means following the recipe. The account is already waiting.",
        ],
      },
    ],
    relatedFieldNoteSlugs: ["privacy-first-architecture-security"],
    relatedProductSlugs: ["aegis", "mybudgetnerd"],
    relatedServiceSlugs: [],
  },
  {
    slug: "privacy-first-architecture-security",
    title: "The Power of Privacy: How Ephemeral Backends Make Our Products Harder to Breach",
    summary:
      "You can't leak what you never stored. How one architectural decision, backends that hold as little user data as possible for as short a time as possible, runs through Aegis BI, MyBudgetNerd, and Thera, and why it's a security strategy, not just a privacy stance.",
    seoDescription:
      "How privacy-first architecture becomes a security strategy: stateless backends and data minimization shrink breach risk across all three of our products.",
    keywords: [
      "privacy-first architecture",
      "ephemeral backend",
      "data minimization",
      "stateless backend security",
      "privacy by design",
      "secure SaaS architecture",
      "fintech data privacy",
    ],
    date: "2026-07-18",
    readingTimeMinutes: 11,
    categories: ["Architecture", "Security"],
    tags: ["Privacy by Design", "Ephemeral Backend", "Data Minimization", "Fintech", "Threat Model"],
    overview: [
      "Every product we ship handles data people are right to be careful with: company financials in Aegis BI, personal bank statements in MyBudgetNerd, competitive capture strategy in Thera. The conventional SaaS answer is to collect all of it into a central database and promise to protect it.",
      "We made the opposite bet across the whole product line: design the backend so it holds as little user data as possible, for as short a time as possible. This note walks through how that one decision plays out in three different architectures, and why it protects both our users and us as the operators.",
    ],
    sections: [
      {
        heading: "Problem",
        paragraphs: [
          "The standard architecture for a data product concentrates risk by default. Users upload their financial records into a central database, and that database grows into two things at once: the most valuable asset the company owns, and the largest concentration of sensitive customer information it holds.",
          "From that point on, security is a continuous obligation with no finish line. Every additional dependency, credential, and endpoint increases operational risk, and because all customers share one store, the impact of a single compromise extends to the entire customer base.",
          "The exposure runs in both directions. Users risk their data; the operator takes on everything attached to holding it: breach disclosure obligations, regulatory liability, subpoena scope, insider risk, and the ongoing operational burden of acting as custodian for thousands of people's bank records.",
          "For a small team shipping consumer and business finance products, that risk profile is a business constraint before it is a technical problem.",
        ],
      },
      {
        heading: "Challenge",
        paragraphs: [
          "The simplest mitigation, collecting nothing, is not available to products whose entire value is analyzing the user's data. Aegis BI has to compute forecasts over a company's ledger. MyBudgetNerd has to parse and categorize real bank statements. Thera has to maintain a detailed profile of a contractor's capabilities and pricing history.",
          "The challenge was to deliver that analysis while refusing, structurally, to become a warehouse of the underlying data.",
          "And it had to be structural. A privacy policy is a promise that can drift with every release; we wanted claims that are enforced by the architecture itself, so the honest answer to \"where does our data go?\" is short, checkable, and independent of anyone's discipline.",
          "It helps to be precise about terms here. Privacy and security are related but distinct goals: privacy determines what information should be collected and who may access it; security determines how that information is protected against unauthorized access. Most architectures treat them as separate workstreams. By minimizing the amount of customer data that exists in the first place, one architectural decision strengthens both: there is less to govern, and less to defend.",
        ],
      },
      {
        heading: "Solution",
        paragraphs: [
          "Across the product line, the backend is ephemeral: it computes on data while a request is in flight and holds none of it afterward. Each product applies the principle at a different point on the spectrum, because each has different constraints.",
          "Aegis BI holds the working dataset on the user's machine. Uploaded workbooks are parsed in-session and stored in the browser's on-device database (IndexedDB); the backend is a stateless calculator. When a dashboard computes or an AI agent runs, the dataset travels with the request, is processed, and is discarded.",
          "Multiple companies can use one Aegis deployment without their data ever mixing, because no server-side copy exists to mix.",
          "MyBudgetNerd processes statements server-side but request-by-request, in memory. A PDF is parsed, transactions are extracted and categorized, results return to the device, and nothing is retained as a customer dataset. There are no bank logins at all. Users import statements they already have, so the product never touches a bank credential. Any history the user wants kept lives on their own device, with a retention window they choose, down to \"off\".",
          "Thera, our capture-intelligence platform, is the case where persistence is genuinely required; a Digital Twin only works if it lives somewhere. There, the principle becomes legibility instead of statelessness: one server, three containers, one SQLite database file.",
          "Every piece of Thera customer data can be enumerated from that single database, with nothing scattered across cloud services and no third-party analytics. The database sits on its own encrypted volume with managed daily snapshots, and a separate nightly encrypted, auto-expiring copy is written off-server. Both exist for disaster recovery; neither is a second home for the data. Each organization's learning loop runs inside its own boundary, and the engine never reads another customer's records.",
          "Thera has since grown the one thing this architecture has to handle carefully: a feature that is deliberately cross-organization. Its partner network lets a member publish a listing that other members' searches can return. The principle survives by being explicit rather than by being absent — the listing exists only if its owner creates it, carries only the fields they filled in, is withdrawn from every search the moment they unpublish, and is a separate record from the Digital Twin, so nothing about a company's pipeline, scores, or drafts can cross with it. Sharing that is chosen and bounded is not the same failure as sharing that is incidental.",
        ],
        diagram: {
          groups: [
            {
              title: "Traditional SaaS",
              flows: [
                [
                  { label: "User" },
                  { label: "Application" },
                  { label: "Central Database", kind: "store" },
                  { label: "Backups", kind: "store" },
                ],
                [
                  { label: "Central Database", kind: "store" },
                  { label: "Analytics" },
                  { label: "AI Services" },
                ],
              ],
            },
            {
              title: "Athena Data Labs",
              flows: [
                [
                  { label: "User Device", kind: "store" },
                  { label: "Browser" },
                  { label: "Stateless Backend" },
                  { label: "Response" },
                ],
              ],
            },
          ],
          caption:
            "The comparison illustrates where data persists (highlighted nodes), not application complexity. A traditional SaaS accumulates customer data in a central database and every system downstream of it; in our architecture, the only persistent store is the user's own device, and the backend processes each request without retaining anything.",
        },
      },
      {
        heading: "Technical Implementation",
        paragraphs: [
          "The implementation reduces to three recurring themes: where data is allowed to rest, what the AI layer is allowed to see, and how much infrastructure exists to defend.",
          "The AI layer gets the same treatment as storage, because model calls are the other path by which user data can leave the system. In every product, AI is opt-in, payloads are minimized, and external calls are outbound-only, made on an explicit user action.",
        ],
        bulletGroups: [
          {
            title: "Data Storage",
            bullets: [
              "Client-side persistence (Aegis BI): each user's source library, saved scenarios, and briefing history live in per-browser IndexedDB; the dataset rides in the request body to a stateless FastAPI backend and is never persisted server-side",
              "Stateless processing (MyBudgetNerd): in-memory PDF parsing with no persistent statement storage; account numbers are extracted for parsing, stripped from responses, and never persisted or forwarded to any external service",
              "User-controlled retention (MyBudgetNerd): learned categorization rules and any kept history stay in the user's device storage, never shared across users or used for global training",
              "Controlled persistence (Thera): all customer data in one SQLite database file on one server, on a dedicated encrypted volume snapshotted daily, with a nightly encrypted, auto-expiring copy as the only off-server backup",
              "Bounded sharing (Thera): the partner-network listing is a separate opt-in record, never the Digital Twin, so the only data that can cross organizations is data its owner published on purpose",
            ],
          },
          {
            title: "AI Layer",
            bullets: [
              "Opt-in by default: no product sends data to a model without an explicit user action; Aegis BI offers tiered privacy modes from strict-local (AI forbidden entirely) to consent-based",
              "Minimal payloads: Aegis BI column mapping sees headers plus a capped row sample, not the dataset; Thera's Anthropic calls are per-request generation only, not used for training",
              "Sanitization: MyBudgetNerd's AI refinement sees sanitized transaction descriptions only",
              "Guardrails: in MyBudgetNerd's Advisor mode the numbers are computed on-device while the model only rephrases wording, with a server-side numeric guard rejecting any AI sentence that cites a figure the brief doesn't contain",
            ],
          },
          {
            title: "Infrastructure",
            bullets: [
              "TLS on every connection; Thera runs as three containers on a single server, with sessions kept in the user's browser",
              "Local caching of public data: SAM.gov and USAspending records are cached on the Thera server rather than routed through third parties",
              "Logging and monitoring configured to exclude sensitive data: Aegis BI error monitoring never sends request bodies or PII",
              "No third-party trackers or analytics anywhere in MyBudgetNerd",
            ],
          },
        ],
      },
      {
        heading: "Results",
        paragraphs: [
          "The clearest way to state the security result is as a set of architectural properties, stated as facts about the system rather than performance claims:",
        ],
        bullets: [
          "Zero persistent customer datasets on the Aegis BI backend",
          "Zero stored bank credentials anywhere in the product line",
          "Zero cross-customer financial databases",
          "User-controlled retention in MyBudgetNerd, down to no retention at all",
          "One SQLite database as Thera's entire customer-data footprint",
          "Two encrypted backup layers, both daily, both expiring automatically",
          "No PII or request bodies sent to monitoring systems",
          "Stateless, request-by-request processing in Aegis BI and MyBudgetNerd",
        ],
        closingParagraphs: [
          "These properties have direct operational consequences. The worst-case outcome of a compromised Aegis BI or MyBudgetNerd backend is bounded, because the server holds no accumulated user data to exfiltrate; an attacker who reaches the backend finds compute, not a dataset. The attack surface that matters, the set of places where customer data rests, is smaller by construction rather than by policy.",
          "Minimization also removed entire categories of operational work. Encryption-at-rest schemes for a central statement store, access audits over that store, retention and deletion tooling: none of these had to be built, so none of them can fail or drift. Auditing reduces to enumerating what exists, and for Thera, disaster recovery planning reduces to restoring a single encrypted file.",
          "Customer-facing processes shorten for the same reason. A security review can trace the complete data flow in one sitting, compliance discussions start from what is never collected, and the scope of any subpoena or disclosure obligation is limited to data that actually exists. Insider risk shrinks in parallel: operators cannot browse records the system never stores.",
          "Finally, the architecture is a trust result. \"Your data stays in your browser; the backend stores nothing\" is a one-sentence answer to the hardest enterprise objection, and it is verifiable rather than contractual. MyBudgetNerd's App Store reviews cite the privacy-conscious design specifically, evidence that users notice the difference between a policy and an architecture.",
        ],
      },
      {
        heading: "Lessons Learned",
        paragraphs: [
          "Data you don't hold is data you can't lose. Minimization beats mitigation: every security control we didn't have to build is a control that can't fail, and absent data can't be exfiltrated, mis-logged, or subpoenaed.",
          "Privacy must be architecture, not policy. A promise in a privacy page can drift with any release; a backend with no database cannot. Making the claims structural is what makes them durable, and what makes them credible to the people most skeptical of data products.",
          "When persistence is unavoidable, make it legible. Thera taught us the complement to statelessness: if you must hold customer data, hold it somewhere you can point to: one file, one server, enumerable in a single table. Knowing precisely where every byte lives is itself a security property.",
          "The same discipline applies to AI calls. Model APIs are a data egress path like any other; opt-in gating, sanitized minimal payloads, and guards that keep models from generating the numbers extend the ephemeral-backend principle into the AI layer.",
          "The broader lesson is that data minimization is a design principle, not a compliance checkbox. Every system we design begins with the same questions:",
        ],
        bullets: [
          "Does this data need to exist?",
          "Does it need to leave the user's device?",
          "If it must exist, how long should it exist?",
          "Can we reduce the amount collected?",
          "Can we make its storage location explicit and understandable?",
        ],
        closingParagraphs: [
          "The answers differ across Aegis BI, MyBudgetNerd, and Thera, but the questions never change. Privacy-first architecture is not a feature to list on a pricing page; it is an engineering discipline, applied at design time, that determines what a system can leak long before anyone has to defend it. You can't leak what you never stored.",
        ],
      },
    ],
    relatedFieldNoteSlugs: ["ai-agents-human-in-the-loop"],
    // Thera is a third of this note's argument and links back to it from its
    // own FAQ; leaving it out of the related rail made that link one-way.
    relatedProductSlugs: ["aegis", "mybudgetnerd", "thera"],
    relatedServiceSlugs: ["ai-solutions", "dashboards"],
  },
  {
    slug: "search-console-indexing-fix",
    title: "From One Page Indexed to All 27: Fixing a Search Console Crawl Block",
    summary:
      "A newly launched site was live and built correctly, but Google had indexed exactly one page and kept rejecting the sitemap with \"Couldn't fetch.\" The cause wasn't the site. It was a protocol mismatch in Search Console.",
    date: "2026-07-02",
    readingTimeMinutes: 4,
    categories: ["Web Engineering", "SEO"],
    tags: ["Search Console", "Sitemap", "Indexing", "HTTPS", "Operations"],
    overview: [
      "This is the operations sequel to our per-route SEO case study. The architecture was already done: every page had its own metadata and the sitemap listed all 27 routes. Yet weeks after launch, Google Search Console still showed a single indexed URL and refused to read the sitemap at all. Here is how we found the real cause and cleared it in a day.",
    ],
    sections: [
      {
        heading: "Problem",
        paragraphs: [
          "Three symptoms, one site. Searching the company name returned only the homepage. The pages that actually drive business, /services and /products and everything beneath them, were invisible in search. And every attempt to submit the sitemap in Search Console failed with the same terse error: \"Couldn't fetch.\"",
          "Nothing was wrong with the pages. They loaded, they were correct, and the sitemap opened fine in a browser. Google just would not read it.",
        ],
      },
      {
        heading: "Challenge",
        paragraphs: [
          "\"Couldn't fetch\" is one of the least specific errors Google gives you. It sends most people rewriting their sitemap or blaming their host, and both are usually wrong. The real work was resisting that instinct and isolating where the request actually broke.",
          "It traced back to three overlapping causes:",
        ],
        bullets: [
          "Protocol mismatch: the Search Console property was set up on the http:// origin, while the live server serves and enforces https://.",
          "A redirect read as a failure: fetching the sitemap over http:// returned a security redirect to https://. Against the http property, Google logged that as a failed fetch instead of following it.",
          "Piecemeal submission: individual paths had been handed to Search Console instead of one canonical sitemap.xml, which muddied discovery further.",
        ],
      },
      {
        heading: "Solution",
        paragraphs: [
          "The fix was configuration, not code, and it took three moves:",
        ],
        bullets: [
          "Align the property with the protocol the site actually serves, managing it from the https:// property so the sitemap request and the server finally agree.",
          "Submit one canonical sitemap.xml covering all 27 routes, instead of loose individual URLs.",
          "Re-submit through the matching secure property, giving Google a clean fetch with no redirect to trip over.",
        ],
      },
      {
        heading: "Technical Implementation",
        paragraphs: [
          "The footprint spans a few properties: the main marketing domain, the Aegis BI app on its own subdomain, and MyBudgetNerd on a separate domain. The block was on the marketing domain, and every step was checked in Search Console rather than assumed.",
        ],
        bullets: [
          "Moved from the http:// URL-prefix property to the canonical https:// property (a Domain property resolves this cleanly too).",
          "Confirmed the sitemap URL returned a 200 over https://, not a redirect, from the property's point of view.",
          "Submitted the single auto-generated sitemap.xml covering services, products, and resources.",
          "Checked that robots.txt pointed at the same canonical sitemap location.",
        ],
      },
      {
        heading: "Results",
        paragraphs: [
          "The sitemap went from a hard \"Couldn't fetch\" to a clean Success on resubmission. Within a day, Google's discovered pages went from a single root URL to all 27 routes in the sitemap.",
          "It also cleared the runway for paid acquisition. Ad crawlers read landing-page copy over the same secure requests, so a future Google Ads account starts on clean pathways instead of fighting the block that was hiding the pages from organic search.",
        ],
      },
      {
        heading: "Lessons Learned",
        paragraphs: [
          "\"Couldn't fetch\" is usually a mismatch, not a broken sitemap. Most of the time the file is fine and the property protocol, or a redirect the property can't follow, is the real culprit. Check that before you touch the XML.",
          "A correct site can still be invisible. Good architecture gets you crawlable pages; it does not guarantee the search engine is configured to read them. The build and the operations are two separate jobs, and both have to be right.",
        ],
      },
    ],
    relatedFieldNoteSlugs: ["react-spa-seo-best-practices"],
    relatedProductSlugs: [],
    relatedServiceSlugs: [],
  },
  {
    slug: "react-spa-seo-best-practices",
    title: "SEO for a React SPA: Making Every Route Visible to Search",
    summary:
      "A React single-page app looks like one generic page to search engines. The playbook we used to make this site fully crawlable: per-route metadata, clean URLs, structured data, and a self-generating sitemap, all without rewriting to SSR.",
    seoDescription:
      "How to make a React SPA crawlable without SSR: per-route metadata, BrowserRouter and host rewrites, JSON-LD, and a sitemap generated from your own route data.",
    keywords: [
      "React SPA SEO",
      "per-route metadata",
      "Vite SEO",
      "sitemap generation",
      "JSON-LD structured data",
      "BrowserRouter rewrite",
    ],
    date: "2026-06-30",
    readingTimeMinutes: 8,
    categories: ["Web Engineering", "SEO"],
    tags: ["React", "SEO", "Vite", "SPA", "Open Graph"],
    overview: [
      "This note is about the site you are reading. athenadatalabs.com is a Vite + React single-page app: fast to build and pleasant to work in, and invisible to search by default. Here is the playbook that fixed it, and what it looked like when we ran it on ourselves.",
    ],
    sections: [
      {
        heading: "The problem: one page pretending to be many",
        paragraphs: [
          "A React single-page app ships one HTML file. Every route, from your product pages to your pricing, shares the same title, description, and social preview baked into index.html. To a search engine choosing which page to rank for a query, your site looks like a single generic page. Deep links cannot rank because, as far as crawlers can tell, they do not exist.",
          "The good news: Googlebot executes JavaScript. You don't need to rebuild on Next.js to rank. You need to make sure that, once your JS runs, each route reports its own identity.",
        ],
      },
      {
        heading: "Why not just move to SSR",
        paragraphs: [
          "The obvious fix, rewriting to a server-rendered framework, is usually out of proportion to the problem. It means a full migration, new hosting requirements, and ongoing complexity, for a marketing site whose pages are mostly static prose.",
          "The constraint worth setting instead: make every route self-describing inside the stack you already have, with zero new runtime dependencies, in a way that cannot silently drift as the site grows to dozens of pages.",
        ],
      },
      {
        heading: "Per-route metadata is the 80/20",
        paragraphs: [
          "Every route needs its own title, meta description, and canonical URL, updated when the route mounts. A small component that upserts head tags via useEffect covers this without dependencies: find-or-create each meta tag, set its content, and manage a single JSON-LD script element replaced on navigation.",
          "Titles should lead with the page's subject, not the brand: 'Products: Aegis BI, MyBudgetNerd' beats 'Athena Data Labs | Page'. Descriptions are your ad copy in the search results, so write them for clicks, not for keyword stuffing.",
          "Structured data varies by page type: service pages emit schema.org Service, product pages SoftwareApplication, and articles like this one emit Article.",
        ],
      },
      {
        heading: "Clean URLs, real routes",
        paragraphs: [
          "Hash routing (/#/products) hides everything after the # from crawlers. Use the History API (BrowserRouter) with a catch-all rewrite to index.html on your host. On AWS Amplify that's a single 404-to-200 rewrite rule.",
          "Then give crawlers a map: a sitemap.xml listing every route, and a robots.txt pointing to it. Generate the sitemap at build time from the same data files that drive the routes. Then a new case study or product page is added automatically, with no separate list to forget. The class of bug where a page exists but the sitemap does not know about it simply cannot occur.",
        ],
      },
      {
        heading: "Know what client-side rendering can't do",
        paragraphs: [
          "Social scrapers (Facebook, LinkedIn, Slack, iMessage) do not run JavaScript. They read the raw HTML, so every route shares the one Open Graph card in index.html. If per-route social previews matter to your funnel, that's the point where you need prerendering or SSR. Be honest about whether they do before taking on that complexity.",
          "Ranking-wise, performance is also a signal: code-split your routes, compress images to WebP, and keep the main bundle lean. The fastest SEO win is often deleting dead kilobytes.",
        ],
      },
      {
        heading: "The checklist",
        paragraphs: ["The order we apply this in practice:"],
        bullets: [
          "BrowserRouter + host rewrite rule (no hash URLs)",
          "Per-route title, description, canonical, robots, and OG/Twitter tags",
          "JSON-LD structured data per page type (Service, SoftwareApplication, Article)",
          "sitemap.xml generated from route data + robots.txt pointing at it",
          "Route-level code splitting and image compression",
          "Search Console: verify, submit the sitemap, watch coverage",
        ],
      },
      {
        heading: "What it looked like on our own site",
        paragraphs: [
          "Every route now reports unique, accurate metadata and structured data, with a self-maintaining sitemap covering the full information architecture. It is verifiable by opening any page's head in DevTools rather than taken on faith, and indexing is tracked in Search Console rather than guessed at.",
          "The playbook also proved transferable: we shared this guidance with independent developers facing the same invisible-SPA problem, and several implemented it and confirmed their pages were being indexed. That is the test of a pattern: it works when someone else runs it.",
          "One caveat worth carrying: doing all of this correctly still did not get the site indexed. The build and the operations are two separate jobs. What was actually blocking us is the subject of the next note.",
        ],
      },
    ],
    relatedFieldNoteSlugs: ["search-console-indexing-fix", "executive-dashboard-design"],
    relatedProductSlugs: ["aegis"],
    relatedServiceSlugs: ["dashboards"],
  },
  {
    slug: "executive-dashboard-design",
    title: "Designing Executive Dashboards People Actually Use",
    summary:
      "Most dashboards are chart collections nobody opens twice. The difference is decision-first design: build around operating questions, surface what changed, and treat alerts as the product.",
    date: "2026-06-10",
    readingTimeMinutes: 6,
    categories: ["Business Intelligence", "Design"],
    tags: ["Dashboards", "BI", "KPIs", "Decision Intelligence"],
    sections: [
      {
        heading: "Why dashboards die",
        paragraphs: [
          "The failure mode is always the same: the dashboard answers 'what data do we have?' instead of 'what decision am I making?'. It gets built, demoed, admired. And then everyone goes back to asking the analyst, because scanning twenty charts to infer whether anything needs attention is work.",
          "A dashboard earns a daily open when it does that inference for the reader.",
        ],
      },
      {
        heading: "Start from operating questions",
        paragraphs: [
          "Before any chart, list the questions the owner actually asks: Can we cover next quarter's payroll? Is revenue on trajectory? Which client are we overexposed to? Each view should answer one of these directly: status, trend, and 'so what', in that order.",
          "This is why we build command centers around a small KPI row (revenue, expenses, net, coverage, margin, runway) with explicit trend deltas, rather than a wall of exploratory charts. Exploration belongs one click deeper.",
        ],
      },
      {
        heading: "Surface change, not state",
        paragraphs: [
          "The most valuable pixel on a dashboard is the one that says something changed. Anomaly flags, threshold alerts, and concentration warnings, computed against the business's own history rather than generic limits, convert the dashboard from wallpaper into a monitoring system.",
          "In Aegis BI these are 'signals': expense anomalies and client-concentration risks surfaced automatically, each with enough context to act on. Users check signals first, KPIs second, charts third.",
        ],
      },
      {
        heading: "Design rules we follow",
        paragraphs: ["A few rules that consistently survive contact with real users:"],
        bullets: [
          "One screen, one owner, one rhythm. A board view and an ops view are different products",
          "Every number gets context: target, trend, or comparison. A lone number is trivia",
          "Alerts must be rare enough to matter; tune thresholds until they are",
          "Drill-downs answer the follow-up question, so the meeting doesn't stall on 'why?'",
          "Latency kills trust. If the data is stale, say so on the dashboard",
        ],
      },
      {
        heading: "The AI layer",
        paragraphs: [
          "Once the dashboard is decision-first, an AI analyst multiplies it: plain-English questions against live dashboard context, narrative briefings, and risk-first recommendations. The dashboard supplies the grounding; the AI supplies the interpretation, and the human makes the call.",
        ],
      },
    ],
    relatedFieldNoteSlugs: ["ai-agents-human-in-the-loop", "practical-forecasting-small-business"],
    relatedProductSlugs: ["aegis"],
    relatedServiceSlugs: ["dashboards", "data-analytics"],
  },
  {
    slug: "practical-forecasting-small-business",
    title: "Practical Forecasting for Small-Business Finance",
    summary:
      "You don't need a data science team to forecast cash and revenue usefully. You need clean history, honest uncertainty, and models simple enough to explain to the person betting on them.",
    date: "2026-05-28",
    readingTimeMinutes: 7,
    categories: ["Machine Learning", "Forecasting"],
    tags: ["Forecasting", "Cash Flow", "Anomaly Detection", "Python"],
    sections: [
      {
        heading: "Forecasting is a decision tool, not a crystal ball",
        paragraphs: [
          "The point of a forecast is not to be right. It's to make a decision better before the outcome arrives. 'Runway is 9–14 months under current burn' changes behavior today, even though it's a range. Businesses that wait for certainty get their forecast from the bank balance, which is always too late.",
        ],
      },
      {
        heading: "Simple models, taken seriously, beat complex models ignored",
        paragraphs: [
          "For monthly small-business financials, disciplined classical methods (trend plus seasonality, exponential smoothing, regularized regression on a few known drivers) routinely perform within noise of heavyweight models, and they're explainable to the owner betting payroll on them.",
          "Explainability isn't a nice-to-have: a forecast the operator doesn't understand is a forecast that gets overridden the first time it's inconvenient.",
        ],
      },
      {
        heading: "The inputs matter more than the algorithm",
        paragraphs: [
          "Most forecasting failures are data failures: revenue recognized inconsistently, expenses lumped irregularly, one-off events left in the training history. Before modeling, the history needs the same cleanup discipline as any analytics project: categorize consistently, flag one-offs, and reconcile against source statements.",
          "This is also where anomaly detection pays twice: the same statistical flags that catch a duplicate charge in production also catch the historical outliers that would silently distort the model.",
        ],
      },
      {
        heading: "Show uncertainty or lose trust",
        paragraphs: [
          "Every forecast we ship carries its uncertainty visibly: ranges, not lines. Point forecasts invite false precision; the first miss discredits the system. Ranges set correct expectations and, paired with scenario modeling ('what if we hire two engineers in Q3?'), turn the forecast into an interactive planning tool rather than a prophecy to argue with.",
        ],
      },
      {
        heading: "A practical starting stack",
        paragraphs: ["What we reach for on real engagements:"],
        bullets: [
          "Pandas for history cleanup and feature preparation",
          "statsmodels / scikit-learn for trend, seasonality, and driver models",
          "Backtesting on held-out months before anyone sees a forward number",
          "Statistical anomaly flags on both history and live data",
          "Retraining on a schedule, with forecast error tracked over time",
        ],
      },
    ],
    relatedFieldNoteSlugs: ["executive-dashboard-design"],
    relatedProductSlugs: ["aegis", "mybudgetnerd"],
    relatedServiceSlugs: ["forecasting", "data-analytics"],
  },
  {
    slug: "ai-agents-human-in-the-loop",
    title: "AI Agents with a Human in the Loop: Trustworthy Automation",
    summary:
      "The AI agents that survive contact with real operations share one design principle: they recommend, humans decide. How we build agents that earn trust instead of demanding it.",
    date: "2026-05-05",
    readingTimeMinutes: 6,
    categories: ["AI", "Automation"],
    tags: ["AI Agents", "LLM", "Human-in-the-Loop", "Claude"],
    sections: [
      {
        heading: "The trust problem",
        paragraphs: [
          "Every organization wants AI leverage; almost none can accept a black box acting unsupervised on their finances or operations. The gap between those two sentences is where most AI projects stall: pilots that impress in demos and never reach production because nobody will sign off on unaccountable automation.",
          "The way through isn't better models. It's better contracts between the agent and the human.",
        ],
      },
      {
        heading: "Recommend, don't act",
        paragraphs: [
          "The agents we ship, Glaukos in Aegis BI and the Oracle in MyBudgetNerd, follow the same contract: the agent analyzes and explains; the human decides and acts. This single constraint dissolves most adoption resistance, because the worst case is a bad explanation, not a bad action.",
          "Counterintuitively, it also makes the AI more used, not less: operators consult an advisor freely precisely because it can't do damage.",
        ],
      },
      {
        heading: "Ground the agent in real context",
        paragraphs: [
          "Generic chatbots give generic advice. An agent becomes an analyst when it's grounded: structured, live business context (metrics, trends, flags, history) supplied to the model so every answer references the operator's actual numbers.",
          "This is context engineering, and it's most of the work. The prompt matters less than the pipeline that assembles what the agent knows at the moment it's asked.",
        ],
      },
      {
        heading: "Show the reasoning",
        paragraphs: [
          "Recommendations ship with their 'because': which metrics moved, which risks were weighed, what would change the conclusion. Visible reasoning lets the operator audit the advice at a glance, and audited advice is advice that gets followed.",
          "Risk-first framing helps too: leading with what could go wrong matches how operators actually think about their business, and it inoculates against the perception that the AI is a cheerleader.",
        ],
      },
      {
        heading: "Make it optional",
        paragraphs: [
          "In consumer products especially, mandatory AI alienates the skeptics you most need to convert. In MyBudgetNerd the AI features are opt-in, and users cite that choice in five-star reviews. Adoption you earn is stickier than adoption you force.",
        ],
      },
    ],
    relatedFieldNoteSlugs: ["executive-dashboard-design"],
    relatedProductSlugs: ["aegis", "mybudgetnerd"],
    relatedServiceSlugs: ["ai-solutions"],
  },
];

export const getFieldNote = (slug: string) => fieldNotes.find((i) => i.slug === slug);
