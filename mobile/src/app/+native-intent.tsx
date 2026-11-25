/**
 * The app always opens on Home (Overview): the link it's launched with —
 * often the last page it was on, as Expo Go relaunches it — is replaced by
 * Home, so What's new can show there (see whats-new.tsx). A launch link that
 * asks for What's new (`?whatsnew=…`) keeps that ask. Links opened while the
 * app is running still go where they point. Native only: on the web (the
 * playground) each page's own link is kept.
 */
export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  try {
    if (!initial) return path;
    const whatsNew = /[?&]whatsnew=([^&#]+)/.exec(path)?.[1];
    return whatsNew ? `/?whatsnew=${whatsNew}` : '/';
  } catch {
    return '/';
  }
}
