/**
 * Pages opened from the profile (the settings pages) return to it: Back lands
 * on Overview, which reopens the profile — already open, without sliding in —
 * when this is set. Cleared once Overview has used it.
 */
let returnToProfile = false;

export function markReturnToProfile() {
  returnToProfile = true;
}

export function shouldReturnToProfile() {
  return returnToProfile;
}

export function clearReturnToProfile() {
  returnToProfile = false;
}
