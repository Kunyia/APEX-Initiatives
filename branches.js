/**
 * branches.js
 *
 * Single source of truth for each APEX program branch.
 * Homepage program cards, the branch page template, the nav menu,
 * and the footer program links are all rendered from this object —
 * add a branch here and it shows up everywhere it needs to.
 *
 * `logo` points at an asset that doesn't exist yet. Drop your real
 * SVG wordmarks into /assets/logos/ using these filenames and the
 * icon-mark fallback (initials in a colored square) will stop being used.
 */

const BRANCHES = {
  sat: {
    id: 'sat',
    name: 'APEX SAT',
    shortName: 'SAT',
    tagline: 'SAT prep and college applications, one-on-one.',
    color: 'purple',
    email: 'sat@apexinitiatives.org',
    logo: '/assets/logos/apex-sat.svg',
    description: 'Study plans, practice tests, and application support from students who\u2019ve been through the process recently.',
    offerings: [
      { tag: 'SAT prep',    title: 'Structured study plans', body: 'Practice tests and section-by-section coaching, paced around your test date.' },
      { tag: 'AP tutoring', title: 'Subject tutoring',        body: 'One-on-one help in AP subjects, from someone who took the same exam.' },
      { tag: 'Applications',title: 'Application support',     body: 'Help with school selection, essays, and understanding financial aid.' },
    ],
    formExtraField: { name: 'sat_score', label: 'Current SAT score (optional)', placeholder: 'e.g. 1180, or "haven\u2019t taken it yet"' },
  },
  health: {
    id: 'health',
    name: 'APEX Health',
    shortName: 'Health',
    tagline: 'A first look at what healthcare careers involve.',
    color: 'green',
    email: 'apexhealthpchs@gmail.com',
    logo: '/assets/logos/apex-health.svg',
    description: 'Health literacy sessions, first aid training, and mentorship for students considering medicine, nursing, or public health.',
    offerings: [
      { tag: 'Workshops',  title: 'Health literacy sessions', body: 'Plain-language sessions on nutrition, sleep, and stress.' },
      { tag: 'Training',   title: 'First aid & CPR',          body: 'Certified training run with partner organizations.' },
      { tag: 'Mentorship', title: 'Pre-health mentorship',    body: 'Paired with a student further along a healthcare track.' },
    ],
  },
  biz: {
    id: 'biz',
    name: 'APEX Business',
    shortName: 'Business',
    tagline: 'Financial literacy and early career skills.',
    color: 'amber',
    email: 'apexbusinesspchs@gmail.com',
    logo: '/assets/logos/apex-business.svg',
    description: 'Budgeting and investing basics, an entrepreneurship track, and mentorship for students curious about business.',
    offerings: [
      { tag: 'Finance',        title: 'Financial literacy', body: 'Budgeting, credit, and investing basics, explained plainly.' },
      { tag: 'Bootcamp',       title: 'Entrepreneurship',   body: 'Build a business idea from scratch and pitch it to a small panel.' },
      { tag: 'Career readiness', title: 'Resumes & interviews', body: 'Help with resumes, LinkedIn, and interview practice.' },
    ],
  },
};

// Freeze so pages can't accidentally mutate shared config at runtime.
Object.values(BRANCHES).forEach(b => Object.freeze(b));
Object.freeze(BRANCHES);
