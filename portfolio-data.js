import { dolciCase } from './case-studies.js';
import { investFutureCase } from './investfuture-case.js';
import { mayaReevesCase } from './maya-reeves-case.js';
import { miniCaseStudies } from './mini-case-studies.js';

export const telegramUrl = 'https://t.me/AnG0r';

export const categories = [
  {
    id: 'web', label: 'Web', width: 80,
    toolRows: [['Все', 'Figma', 'Tilda', 'Codex'], ['Claude']],
  },
  {
    id: 'app', label: 'App', width: 80,
    toolRows: [['Все', 'Figma']],
  },
  {
    id: 'graph', label: 'Graph', width: 88,
    toolRows: [['Все', 'Figma', 'Adobe']],
  },
  {
    id: 'engineer', label: 'Engineer', width: 140,
    toolRows: [['Все', 'n8n', 'Codex', 'Claude']],
  },
  {
    id: 'optimization', label: 'Optimization', width: 160,
    toolRows: [['Все', 'Figma', 'n8n']],
  },
];

// У кейса есть category (id направления), title, format, tools (массив),
// а также необязательные cover и caseId из case-studies.js или внешний url.
export const projects = [
  {
    caseId: dolciCase.id,
    category: dolciCase.category,
    title: dolciCase.title,
    format: 'Интернет-магазин',
    tools: ['Figma', 'Codex'],
    cover: dolciCase.gallery[0].src,
  },
  ...[investFutureCase, mayaReevesCase, ...miniCaseStudies].map(({ id, category, title, format, tools, gallery }) => ({
    caseId: id,
    category,
    title,
    format,
    tools,
    cover: gallery[0].src,
  })),
];
