import i18next, { use, type Resource, type TFunction } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

export const getResources = (): Resource => {
  const localesContext = require.context('../../locales');
  return localesContext.keys().reduce((acc, cur) => {
    const m = cur.match(/([^/]*)(?:\.([^.]+$))/);
    if (m === null) throw new Error(`Invalid import path: ${cur}`);
    return {
      ...acc,
      [m[1] as RegExpMatchArray[number]]: localesContext(cur).default
    };
  }, {});
};

type InitI18nParams = Partial<{
  useDetector: boolean;
  lng: string;
}>;
export const initI18n = (params?: InitI18nParams): Promise<TFunction> =>
  (params?.useDetector ?? true ? use(LanguageDetector) : i18next)
    .use(initReactI18next)
    .init({
      resources: getResources(),
      lng: 'zh-CN', // Always set to 'zh-CN'
      fallbackLng: 'zh-CN', // Fallback language is also 'zh-CN'
      interpolation: { escapeValue: false },
      debug: process.env.NODE_ENV === 'development'
    });
