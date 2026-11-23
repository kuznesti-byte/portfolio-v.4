import { dolciCase } from './case-studies.js?v=6';
import { investFutureCase } from './investfuture-case.js?v=6';
import { mayaReevesCase } from './maya-reeves-case.js';
import { inzhirCase } from './inzhir-case.js';
import { miniCaseStudies } from './mini-case-studies.js';

export const telegramUrl = 'https://t.me/AnG0r';

export const projects = [
  {
    caseId: dolciCase.id,
    category: dolciCase.category,
    title: dolciCase.title,
    format: 'Интернет-магазин',
    tools: ['Figma', 'Codex'],
    cover: dolciCase.gallery[0].src,
  },
  {
    caseId: investFutureCase.id,
    category: investFutureCase.category,
    title: investFutureCase.title,
    format: investFutureCase.format,
    tools: investFutureCase.tools,
    cover: investFutureCase.gallery[0].src,
  },
  {
    caseId: inzhirCase.id,
    category: 'web',
    title: inzhirCase.title,
    format: inzhirCase.format,
    tools: ['Figma', 'Codex'],
    cover: inzhirCase.gallery[0].src,
  },
  ...[mayaReevesCase, ...miniCaseStudies].map(({ id, category, title, format, tools, gallery }) => ({
    caseId: id,
    category,
    title,
    format,
    tools,
    cover: gallery[0].src,
  })),
];
