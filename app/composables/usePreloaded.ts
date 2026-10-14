/** Flips to true when the preloader starts revealing the page — hero intro listens to it. */
export const usePreloaded = () => useState<boolean>('preloaded', () => false)
