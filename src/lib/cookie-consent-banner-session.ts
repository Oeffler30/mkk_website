/**
 * In-memory fallback so the banner stays hidden for this tab even if the
 * component instance is recreated before localStorage can be read again.
 */
let bannerDismissedThisSession = false;

export function markCookieBannerDismissedThisSession(): void {
	bannerDismissedThisSession = true;
}

export function wasCookieBannerDismissedThisSession(): boolean {
	return bannerDismissedThisSession;
}
