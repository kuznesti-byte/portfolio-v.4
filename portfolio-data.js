import { dolciCase } from './case-studies.js';
import { investFutureCase } from './investfuture-case.js';
import { mayaReevesCase } from './maya-reeves-case.js';
import { inzhirCase } from './inzhir-case.js';
import { miniCaseStudies } from './mini-case-studies.js';

export const telegramUrl = 'https://t.me/AnG0r';

export const categories = [
  {
    id: 'all', label: 'Все', width: 64,
    toolRows: [['Все', 'Figma', 'Tilda', 'Codex'], ['Claude', 'n8n']],
  },
  {
    id: 'web', label: 'Web', width: 80,
    toolRows: [['Все', 'Figma', 'Tilda', 'Codex'], ['Claude']],
  },
  {
    id: 'app', label: 'App', width: 80,
    toolRows: [['Все', 'Figma']],
  },
  {
    id: 'engineer', label: 'Engineer', width: 140,
    toolRows: [['Все', 'n8n', 'Codex', 'Claude']],
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
  // Иинжир показываем сразу в двух направлениях: Web и Engineer.
  {
    caseId: inzhirCase.id,
    category: 'web',
    title: inzhirCase.title,
    format: inzhirCase.format,
    tools: ['Figma', 'Codex'],
    cover: inzhirCase.gallery[0].src,
  },
  {
    caseId: inzhirCase.id,
    category: 'engineer',
    title: inzhirCase.title,
    format: inzhirCase.format,
    tools: ['Codex', 'Claude'],
    cover: inzhirCase.gallery[0].src,
  },
];
