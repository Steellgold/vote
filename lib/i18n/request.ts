import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

type ISOLang =
  | "aa" | "ab" | "ae" | "af" | "ak" | "am" | "an" | "ar" | "as" | "av"
  | "ay" | "az" | "ba" | "be" | "bg" | "bh" | "bi" | "bm" | "bn" | "bo"
  | "br" | "bs" | "ca" | "ce" | "ch" | "co" | "cr" | "cs" | "cu" | "cv"
  | "cy" | "da" | "de" | "dv" | "dz" | "ee" | "el" | "en" | "eo" | "es"
  | "et" | "eu" | "fa" | "ff" | "fi" | "fj" | "fo" | "fr" | "fy" | "ga"
  | "gd" | "gl" | "gn" | "gu" | "gv" | "ha" | "he" | "hi" | "ho" | "hr"
  | "ht" | "hu" | "hy" | "hz" | "ia" | "id" | "ie" | "ig" | "ii" | "ik"
  | "io" | "is" | "it" | "iu" | "ja" | "jv" | "ka" | "kg" | "ki" | "kj"
  | "kk" | "kl" | "km" | "kn" | "ko" | "kr" | "ks" | "ku" | "kv" | "kw"
  | "ky" | "la" | "lb" | "lg" | "li" | "ln" | "lo" | "lt" | "lu" | "lv"
  | "mg" | "mh" | "mi" | "mk" | "ml" | "mn" | "mr" | "ms" | "mt" | "my"
  | "na" | "nb" | "nd" | "ne" | "ng" | "nl" | "nn" | "no" | "nr" | "nv"
  | "ny" | "oc" | "oj" | "om" | "or" | "os" | "pa" | "pi" | "pl" | "ps"
  | "pt" | "qu" | "rm" | "rn" | "ro" | "ru" | "rw" | "sa" | "sc" | "sd"
  | "se" | "sg" | "si" | "sk" | "sl" | "sm" | "sn" | "so" | "sq" | "sr"
  | "ss" | "st" | "su" | "sv" | "sw" | "ta" | "te" | "tg" | "th" | "ti"
  | "tk" | "tl" | "tn" | "to" | "tr" | "ts" | "tt" | "tw" | "ty" | "ug"
  | "uk" | "ur" | "uz" | "ve" | "vi" | "vo" | "wa" | "wo" | "xh" | "yi"
  | "yo" | "za" | "zh" | "zu";
type SupportedLangs = Record<string, ISOLang>;

const detectLanguage = (
  acceptLanguage: string | null,
  supportedLanguages: SupportedLangs = { en: "en" },
  defaultLang: ISOLang = "en"
): ISOLang => {
  if (!acceptLanguage) return defaultLang;
  
  const browserLang = acceptLanguage.split(",")[0].toLowerCase();
  
  const exactMatch = Object.entries(supportedLanguages).find(([key]) => browserLang === key || browserLang.startsWith(key + "-"));
  if (exactMatch) return exactMatch[1];
  
  const partialMatch = Object.entries(supportedLanguages).find(([key]) => browserLang.startsWith(key));
  if (partialMatch) return partialMatch[1];
  
  return defaultLang;
};

export default getRequestConfig(async () => {
  const headersList = headers();
  const cookieStore = cookies();
  
  const supportedLanguages: SupportedLangs = {
    en: "en",
    fr: "fr",
  };

  const browserLocale = detectLanguage(
    (await headersList).get("accept-language"),
    supportedLanguages,
    "en"
  );
  
  const locale = (await cookieStore).get("locale")?.value || browserLocale;
 
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});