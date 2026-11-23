import { miniCaseStudies } from './mini-case-studies.js';
import { investFutureCase } from './investfuture-case.js?v=6';
import { mayaReevesCase } from './maya-reeves-case.js';
import { inzhirCase } from './inzhir-case.js';

import { dolciCase } from './dolci-e-fiori-case.js';

export { dolciCase };

export const caseStudies = [dolciCase, investFutureCase, mayaReevesCase, inzhirCase, ...miniCaseStudies];

export function caseUrl(caseId) {
  return `#case/${caseId}`;
}
