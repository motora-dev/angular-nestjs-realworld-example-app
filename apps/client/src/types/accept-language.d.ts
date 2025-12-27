declare module 'accept-language' {
  interface AcceptLanguage {
    languages(languages: string[]): void;
    get(acceptLanguageHeader: string | undefined): string | null;
  }
  const acceptLanguage: AcceptLanguage;
  export default acceptLanguage;
}
