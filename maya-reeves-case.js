const originalCase = 'https://ak-silk-seven.vercel.app/maya_reeves';
const liveSite = 'https://maya-reeves-six.vercel.app/';

function screen(name, caption, layout) {
  return { type: 'image', src: `./assets/maya-reeves/${name}.webp`, alt: caption, caption, layout };
}

const media = {
  cover: screen('cover', 'Career Mentor на компьютере и телефоне'),
  services: screen('services', 'Блок услуг с тремя форматами работы'),
  booking: screen('booking', 'Финальный блок записи на бесплатный звонок'),
  aboutWireframe: screen('about-wireframe', 'Схема блоков о менторе и форматах работы'),
  aboutFinal: screen('about-final', 'Те же блоки в финальном дизайне'),
  uiKit: screen('ui-kit', 'UI Kit в Figma с типографикой, кнопками и карточками'),
  mobileEn: screen('mobile-en', 'Первый экран на английском', 'portrait'),
  mobileRu: screen('mobile-ru', 'Первый экран на русском', 'portrait'),
  mobileMenu: screen('mobile-menu', 'Раскрытое мобильное меню с кнопкой записи', 'portrait'),
};

export const mayaReevesCase = {
  id: 'maya-reeves',
  category: 'web',
  format: 'Лендинг',
  tools: ['Figma', 'Claude'],
  title: 'Maya Reeves · Career Mentor',
  subtitle: 'Двуязычный лендинг карьерного ментора для женщин в tech',
  tags: [
    { label: 'Портфолио-концепт' },
    { label: 'UX/UI' },
    { label: 'EN/RU' },
    { label: 'React', featured: true },
  ],
  gallery: [media.cover, media.services, media.booking],
  galleryLink: { label: 'Открыть лендинг', href: liveSite },
  sections: [
    {
      id: 'brief',
      title: 'Задача и роль',
      blocks: [
        { type: 'text', text: 'Maya Reeves — вымышленный карьерный ментор и спикер. Я придумала для неё лендинг, который помогает посетительнице понять, с какими задачами можно обратиться к ментору, выбрать подходящий формат и записаться на бесплатный ознакомительный звонок.' },
        { type: 'text', label: 'Мой вклад', text: 'За три недели я разобрала аналоги, спроектировала структуру, разработала визуальную систему и собрала двуязычный адаптивный сайт.' },
      ],
    },
    {
      id: 'research',
      title: 'Аудитория',
      blocks: [
        { type: 'text', text: 'Я изучила сайты карьерных менторов и персональных брендов, сравнила порядок блоков, подачу услуг и путь к записи. На основе этого сформулировала три сценария для концепта.' },
        { type: 'list', items: [
          'Переход в tech. Нужны понятный план и помощь с первым шагом.',
          'Рост на уровне junior или middle. Важны карьерная стратегия, портфолио и подготовка к собеседованиям.',
          'Переход к руководящей роли. Нужна поддержка в переговорах и в том, как говорить о своей экспертизе.',
        ] },
      ],
    },
    {
      id: 'structure',
      title: 'Структура',
      blocks: [
        { type: 'text', text: 'Первый экран объясняет, кто такая Maya, и даёт два пути — сразу записаться или посмотреть истории. Дальше идут опыт ментора, форматы работы и выступления. Финальный блок возвращает к записи, когда посетительница уже разобралась в предложении.' },
        { type: 'text', text: 'До работы с визуалом я разложила страницу на смысловые блоки и выбрала места для кнопок. Истории клиентов, цифры и выступления в макете служат демонстрационным контентом вымышленного бренда.' },
        { type: 'media', items: [media.aboutWireframe, media.aboutFinal] },
      ],
    },
    {
      id: 'visual-system',
      title: 'Визуальная система',
      blocks: [
        { type: 'text', text: 'Тёмный фон, крупная сжатая типографика и чёрно-белый портрет задают редакционную подачу. Лаймовый акцент выделяет кнопки и помогает заметить следующее действие. В UI Kit собраны типографика, навигация, карточки услуг, истории и состояния кнопок.' },
        { type: 'media', items: [media.uiKit] },
      ],
    },
    {
      id: 'responsive',
      title: 'Языки и адаптив',
      blocks: [
        { type: 'text', text: 'Русский и английский тексты отличаются по длине. Я проверяла, как меняются переносы, визуальная иерархия и положение кнопок при переключении языка. На телефоне сетки складываются в вертикальные блоки, а навигация сворачивается в компактное меню с кнопкой записи.' },
        { type: 'media', items: [media.mobileEn, media.mobileRu, media.mobileMenu] },
      ],
    },
    {
      id: 'development',
      title: 'Реализация',
      blocks: [
        { type: 'text', text: 'Сайт собран из React-компонентов. Tailwind CSS задаёт сетку и адаптивные состояния, а Framer Motion отвечает за появление секций, наведение на карточки и акценты на кнопках.' },
        { type: 'text', label: 'Claude', text: 'Использовала как помощника при разработке структуры компонентов, рефакторинге и отдельных технических решениях.' },
        { type: 'text', label: 'Результат', text: 'Работающий лендинг с версиями EN/RU, адаптивной навигацией и сценарием записи на ознакомнительный звонок.' },
        { type: 'link', label: 'Полный разбор проекта', href: originalCase },
      ],
    },
  ],
};
