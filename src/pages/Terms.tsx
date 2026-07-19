import LegalLayout from "@/components/LegalLayout";
import Seo from "@/components/Seo";

const Terms = () => {
  return (
    <LegalLayout title="Terms of Use" updated="June 30, 2026">
      <Seo
        title="Terms of Use"
        description="The terms governing use of the Athena Data Labs marketing website at athenadatalabs.com."
        path="/terms"
        image="/og/terms.png"
      />
      <p>
        These Terms of Use ("Terms") govern your access to and use of the marketing website at{" "}
        <a href="https://athenadatalabs.com">athenadatalabs.com</a> (the "Site"), operated by{" "}
        <strong>Athena Analytics LLC</strong>, doing business as <strong>Athena Data Labs</strong>{" "}
        ("Athena," "we," "us," or "our"). By accessing or using the Site, you agree to these Terms.
        If you do not agree, please do not use the Site.
      </p>

      <h2>Use of the Site</h2>
      <p>You may use the Site for lawful, informational, and business purposes. You agree not to:</p>
      <ul>
        <li>use the Site in any way that violates applicable law or regulation;</li>
        <li>attempt to gain unauthorized access to the Site, its servers, or related systems;</li>
        <li>interfere with or disrupt the Site, or introduce malware or other harmful code;</li>
        <li>
          scrape, harvest, or collect data from the Site through automated means in a manner that
          burdens our systems or infringes our rights; or
        </li>
        <li>
          copy, reproduce, or create derivative works from the Site's content except as expressly
          permitted.
        </li>
      </ul>

      <h2>Intellectual Property</h2>
      <p>
        The Site and its contents, including text, graphics, logos, the Athena name and marks,
        product names (such as Aegis BI and MyBudgetNerd), design, and software, are owned by or
        licensed to Athena Analytics LLC and are protected by intellectual‑property laws. We grant
        you a limited, revocable, non‑exclusive license to view the Site for its intended purpose.
        All rights not expressly granted are reserved.
      </p>

      <h2>Products and Services</h2>
      <p>
        This Site is informational. Our products and services, including <strong>Aegis BI</strong>,{" "}
        <strong>MyBudgetNerd</strong>, and any consulting or software offerings, are provided under
        separate agreements and terms. In the event of a conflict, the product‑ or service‑specific
        agreement governs that product or service.
      </p>

      <h2>No Professional Advice</h2>
      <p>
        Content on the Site is provided for general informational purposes only and does not
        constitute financial, investment, legal, tax, or other professional advice. Any figures,
        demonstrations, or sample data shown are illustrative, do not represent actual results, and
        are not a guarantee of any outcome. You are responsible for your own decisions.
      </p>

      <h2>Third‑Party Links and Content</h2>
      <p>
        The Site may link to or embed third‑party websites, applications, or services. We do not
        control and are not responsible for their content, products, or practices, and including a
        link does not imply endorsement.
      </p>

      <h2>Disclaimer of Warranties</h2>
      <p>
        THE SITE IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTIES OF ANY KIND, WHETHER
        EXPRESS, IMPLIED, OR STATUTORY, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
        PARTICULAR PURPOSE, TITLE, AND NON‑INFRINGEMENT. WE DO NOT WARRANT THAT THE SITE WILL BE
        UNINTERRUPTED, SECURE, ERROR‑FREE, OR THAT ANY CONTENT IS ACCURATE OR CURRENT.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, ATHENA ANALYTICS LLC AND ITS OWNERS, EMPLOYEES, AND
        AGENTS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
        DAMAGES, OR FOR ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM OR RELATING TO YOUR USE
        OF THE SITE. OUR TOTAL LIABILITY FOR ANY CLAIM RELATING TO THE SITE WILL NOT EXCEED ONE
        HUNDRED U.S. DOLLARS (US$100).
      </p>

      <h2>Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless Athena Analytics LLC from any claims, damages,
        liabilities, and expenses (including reasonable attorneys' fees) arising from your misuse of
        the Site or your violation of these Terms.
      </p>

      <h2>Governing Law</h2>
      <p>
        These Terms are governed by the laws of the State of Michigan, United States, without regard
        to its conflict‑of‑laws rules. You agree that any dispute relating to the Site will be
        subject to the exclusive jurisdiction of the state and federal courts located in Michigan,
        unless otherwise required by applicable law.
      </p>

      <h2>Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. Changes are effective when posted, as indicated
        by the "Last updated" date above. Your continued use of the Site after changes are posted
        means you accept the updated Terms.
      </p>

      <h2>Contact Us</h2>
      <p>
        Questions about these Terms can be sent to{" "}
        <a href="mailto:info@athenadatalabs.com">info@athenadatalabs.com</a>.
      </p>
    </LegalLayout>
  );
};

export default Terms;
