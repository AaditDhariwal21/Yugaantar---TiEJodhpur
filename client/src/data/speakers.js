/* ============================================================================
   Section 3.8 — Delegates.

   Not everyone listed here speaks — the section covers speakers, mentors,
   investors and industry guests alike, which is why it reads "Delegates".

   Shape: { name, photo, country, linkedin, role, org, tier }
     tier: "key"     → the featured, larger flex row ("Featured Delegates")
           "general" → the denser auto-fit grid ("Delegates")
     photo: null     → card falls back to the person's initial on a red tint,
                       which is exactly what the reference does for missing art.

   TODO(content): the entire roster below is placeholder. Replace wholesale —
   this file is data only, no component changes needed.
   ========================================================================== */

export const speakersMeta = {
  badge: "Who You'll Meet",
  heading: "Delegates",
  sub: "Founders, investors, mentors and industry leaders joining us in Jodhpur. The line-up is still coming together — names are indicative and subject to change.",
  keyLabel: "Featured Delegates",
  generalLabel: "Delegates",
};

const ph = (n, role, org, country = "India", tier = "general", tag = null) => ({
  name: n,
  role,
  org,
  country,
  tier,
  tag,
  photo: null,
  linkedin: null,
});

export const speakers = [
  // ---- Key speakers (featured row) --------------------------------------
  ph("[Speaker Name 01]", "Founder", "[Organisation]", "India", "key", "Keynote"),
  ph("[Speaker Name 02]", "Managing Partner", "[Venture Fund]", "India", "key"),
  ph("[Speaker Name 03]", "Chairman", "[Group]", "India", "key"),
  ph("[Speaker Name 04]", "Operating Partner", "[Global Fund]", "UK", "key"),
  ph("[Speaker Name 05]", "Co-Founder & CEO", "[Company]", "US", "key"),
  ph("[Speaker Name 06]", "Ambassador", "[Mission]", "India", "key"),
  ph("[Speaker Name 07]", "Commissioner", "[Investment Agency]", "India", "key"),
  ph("[Speaker Name 08]", "General Partner", "[Quantum Fund]", "Singapore", "key"),
  ph("[Speaker Name 09]", "Managing Director", "[Medical Centre]", "India", "key"),
  ph("[Speaker Name 10]", "Founder & CEO", "[Deep-tech Co]", "India", "key"),
  ph("[Speaker Name 11]", "Advisory & Leadership", "[Advisory Firm]", "UAE", "key"),

  // ---- General roster ----------------------------------------------------
  ph("[Speaker Name 12]", "CEO", "[Family Office]", "UK"),
  ph("[Speaker Name 13]", "Managing Director", "[Partners LLP]", "India"),
  ph("[Speaker Name 14]", "Global Operations Lead", "[FMCG Major]", "Switzerland"),
  ph("[Speaker Name 15]", "Managing Partner", "[Legal Associates]", "Italy"),
  ph("[Speaker Name 16]", "Vice President, Supply Chain", "[Research Firm]", "UK"),
  ph("[Speaker Name 17]", "Board Member", "[National Post]", "Switzerland"),
  ph("[Speaker Name 18]", "Co-Founder", "[AI Startup]", "India"),
  ph("[Speaker Name 19]", "Chairman", "[Holdings]", "India"),
  ph("[Speaker Name 20]", "Managing Partner", "[Impact Fund]", "Netherlands"),
  ph("[Speaker Name 21]", "Senior Manager, Trade & Invest", "[Trade Body]", "India"),
  ph("[Speaker Name 22]", "Founder & CEO", "[Agentic AI Co]", "India"),
  ph("[Speaker Name 23]", "Head of Transport & Logistics", "[Energy Major]", "Switzerland"),
  ph("[Speaker Name 24]", "Managing Director", "[Gateway Partners]", "Germany"),
  ph("[Speaker Name 25]", "Partner", "[Big Four]", "US"),
  ph("[Speaker Name 26]", "Founder", "[Platform Co]", "India"),
  ph("[Speaker Name 27]", "Managing Partner", "[Launch Fund]", "Canada"),
  ph("[Speaker Name 28]", "Partner", "[Strategy Consultancy]", "Switzerland"),
  ph("[Speaker Name 29]", "Country Head", "[IT Services Major]", "India"),
  ph("[Speaker Name 30]", "Founder & Managing Partner", "[Consulting BV]", "Belgium"),
  ph("[Speaker Name 31]", "Managing Partner", "[Transformation Fund]", "India"),
  ph("[Speaker Name 32]", "Vice Chairman", "[Industrial Group]", "India"),
  ph("[Speaker Name 33]", "Global Technology Executive", "[Tech Major]", "India"),
  ph("[Speaker Name 34]", "Deputy Chief Financial Officer", "[Semiconductor Co]", "US"),
  ph("[Speaker Name 35]", "Founder & CEO", "[Cloud Co]", "India"),
  ph("[Speaker Name 36]", "Commercialisation Officer", "[Space Agency]", "France"),
  ph("[Speaker Name 37]", "Chief Physician", "[Clinical Group]", "Germany"),
  ph("[Speaker Name 38]", "VC Investor & Partner", "[Ventures]", "Netherlands"),
  ph("[Speaker Name 39]", "Non-Executive Director", "[Infotech Ltd]", "India"),
  ph("[Speaker Name 40]", "Sales & Strategy", "[Studio]", "India"),
  ph("[Speaker Name 41]", "Chief Executive Officer", "[AI Platform]", "India"),
];
