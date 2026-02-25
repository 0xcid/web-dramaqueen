export type FullscreenType = 'native' | 'video-only' | 'pseudo' | 'none';

export interface FullscreenSupport {
    supported: boolean;
    type: FullscreenType;
    reason?: string;
}

export interface FullscreenState {
    isFullscreen: boolean;
    type: FullscreenType;
}

declare global {
    interface Document {
        webkitFullscreenEnabled?: boolean;
        webkitFullscreenElement?: Element | null;
        webkitExitFullscreen?: () => Promise<void>;
        mozFullScreenEnabled?: boolean;
        mozFullScreenElement?: Element | null;
        mozCancelFullScreen?: () => Promise<void>;
        msFullscreenEnabled?: boolean;
        msFullscreenElement?: Element | null;
        msExitFullscreen?: () => Promise<void>;
    }

    interface HTMLElement {
        webkitRequestFullscreen?: (options?: FullscreenOptions) => Promise<void>;
        webkitEnterFullscreen?: () => Promise<void>;
        mozRequestFullScreen?: (options?: FullscreenOptions) => Promise<void>;
        msRequestFullscreen?: (options?: FullscreenOptions) => Promise<void>;
    }

    interface HTMLVideoElement {
        webkitEnterFullscreen?: () => Promise<void>;
        webkitExitFullscreen?: () => Promise<void>;
        webkitDisplayingFullscreen?: boolean;
        webkitSupportsFullscreen?: boolean;
    }
}

export function detectPlatform() {
    if (typeof navigator === 'undefined') {
        return {
            isIOS: false,
            isAndroid: false,
            isTelegram: false,
            isWhatsApp: false,
            isFacebook: false,
            isInstagram: false,
            isTikTok: false,
            isWebView: false,
            isMobile: false,
            isSafari: false,
            isBrave: false,
        };
    }

    const ua = navigator.userAgent;
    const platform = navigator.platform || '';

    const isIOS = /iPad|iPhone|iPod/.test(ua) ||
        (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(ua);
    const isMobile = isIOS || isAndroid || /Mobi|Android/i.test(ua);

    // Social Media WebView Detection
    const isTelegram = /Telegram/i.test(ua);
    const isWhatsApp = /WhatsApp/i.test(ua);
    const isFacebook = /FB_IAB|FBAN|FBAV|FB4A|Facebook/i.test(ua);
    const isInstagram = /Instagram/i.test(ua);
    const isTikTok = /TikTok|Bytedance/i.test(ua);

    const isWebView = isTelegram || isWhatsApp || isFacebook || isInstagram || isTikTok ||
        /MicroMessenger/i.test(ua) ||
        /Line/i.test(ua) ||
        /Twitter/i.test(ua);

    const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS/.test(ua);
    const isBrave = isSafari && /Brave/i.test(ua);

    return {
        isIOS,
        isAndroid,
        isTelegram,
        isWhatsApp,
        isFacebook,
        isInstagram,
        isTikTok,
        isWebView,
        isMobile,
        isSafari,
        isBrave,
    };
}

export function getFullscreenSupport(): FullscreenSupport {
    if (typeof document === 'undefined') {
        return { supported: false, type: 'none', reason: 'SSR' };
    }

    const platform = detectPlatform();

    // Check if we're in a restricted WebView
    // These WebViews don't support native Fullscreen API
    if (platform.isTelegram || platform.isWhatsApp || platform.isFacebook || platform.isInstagram || platform.isTikTok) {
        const webViewName =
            platform.isTelegram ? 'Telegram' :
                platform.isWhatsApp ? 'WhatsApp' :
                    platform.isFacebook ? 'Facebook' :
                        platform.isInstagram ? 'Instagram' :
                            platform.isTikTok ? 'TikTok' : 'Unknown';

        return {
            supported: true,
            type: 'pseudo',
            reason: `${webViewName} WebView does not support native fullscreen`,
        };
    }

    // Check standard Fullscreen API
    if (document.fullscreenEnabled ||
        document.webkitFullscreenEnabled ||
        document.mozFullScreenEnabled ||
        document.msFullscreenEnabled) {
        return { supported: true, type: 'native' };
    }

    // iOS Safari - video-only fullscreen
    if (platform.isIOS) {
        const testVideo = document.createElement('video');
        if ('webkitEnterFullscreen' in testVideo || 'webkitSupportsFullscreen' in testVideo) {
            return {
                supported: true,
                type: 'video-only',
                reason: 'iOS only supports fullscreen on video elements',
            };
        }
    }

    // Fallback to pseudo fullscreen
    return {
        supported: true,
        type: 'pseudo',
        reason: 'Native fullscreen not supported, using CSS fallback',
    };
}

export function isCurrentlyFullscreen(): boolean {
    if (typeof document === 'undefined') return false;

    return !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement ||
        (document.querySelector('.pseudo-fullscreen') !== null)
    );
}

export async function enterFullscreen(
    container: HTMLElement,
    video?: HTMLVideoElement | null
): Promise<FullscreenState> {
    const support = getFullscreenSupport();
    const platform = detectPlatform();

    switch (support.type) {
        case 'native':
            try {
                // Try standard API first
                if (container.requestFullscreen) {
                    await container.requestFullscreen();
                } else if (container.webkitRequestFullscreen) {
                    await container.webkitRequestFullscreen();
                } else if (container.mozRequestFullScreen) {
                    await container.mozRequestFullScreen();
                } else if (container.msRequestFullscreen) {
                    await container.msRequestFullscreen();
                } else {
                    throw new Error('No native fullscreen method available');
                }
                return { isFullscreen: true, type: 'native' };
            } catch (err) {
                console.warn('[Fullscreen] Native fullscreen failed, trying fallback:', err);
                // Fall through to video-only or pseudo
                if (platform.isIOS && video) {
                    return enterVideoFullscreen(video);
                }
                return enterPseudoFullscreen(container);
            }

        case 'video-only':
            if (video) {
                return enterVideoFullscreen(video);
            }
            return enterPseudoFullscreen(container);

        case 'pseudo':
        default:
            return enterPseudoFullscreen(container);
    }
}

async function enterVideoFullscreen(video: HTMLVideoElement): Promise<FullscreenState> {
    try {
        if (video.webkitEnterFullscreen) {
            await video.webkitEnterFullscreen();
            return { isFullscreen: true, type: 'video-only' };
        }
        throw new Error('webkitEnterFullscreen not available');
    } catch (err) {
        console.warn('[Fullscreen] Video fullscreen failed:', err);
        return { isFullscreen: false, type: 'none' };
    }
}

function enterPseudoFullscreen(container: HTMLElement): FullscreenState {
    container.classList.add('pseudo-fullscreen');
    document.body.style.overflow = 'hidden';

    // Store original scroll position
    (container as any)._originalScrollY = window.scrollY;

    return { isFullscreen: true, type: 'pseudo' };
}

export async function exitFullscreen(
    container: HTMLElement,
    video?: HTMLVideoElement | null
): Promise<FullscreenState> {
    const support = getFullscreenSupport();

    // Check for pseudo fullscreen first
    if (container.classList.contains('pseudo-fullscreen')) {
        return exitPseudoFullscreen(container);
    }

    // Try to exit video fullscreen on iOS
    if (support.type === 'video-only' && video) {
        if (video.webkitExitFullscreen) {
            try {
                await video.webkitExitFullscreen();
                return { isFullscreen: false, type: 'video-only' };
            } catch (err) {
                console.warn('[Fullscreen] Video exit failed:', err);
            }
        }
    }

    // Try native exit
    try {
        if (document.exitFullscreen) {
            await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            await document.msExitFullscreen();
        }

        return { isFullscreen: false, type: 'native' };
    } catch (err) {
        console.warn('[Fullscreen] Exit failed:', err);

        // Force exit pseudo as last resort
        if (container.classList.contains('pseudo-fullscreen')) {
            return exitPseudoFullscreen(container);
        }

        return { isFullscreen: false, type: 'none' };
    }
}

function exitPseudoFullscreen(container: HTMLElement): FullscreenState {
    container.classList.remove('pseudo-fullscreen');
    document.body.style.overflow = '';

    // Restore scroll position
    const originalScrollY = (container as any)._originalScrollY;
    if (typeof originalScrollY === 'number') {
        window.scrollTo(0, originalScrollY);
    }

    return { isFullscreen: false, type: 'pseudo' };
}

export async function toggleFullscreenHelper(
    container: HTMLElement,
    video?: HTMLVideoElement | null
): Promise<FullscreenState> {
    const isFullscreen = isCurrentlyFullscreen();

    if (isFullscreen) {
        return exitFullscreen(container, video);
    } else {
        return enterFullscreen(container, video);
    }
}

export function addFullscreenListeners(
    container: HTMLElement,
    callback: (state: FullscreenState) => void
): () => void {
    const handleFullscreenChange = () => {
        const isFullscreen = isCurrentlyFullscreen();
        const support = getFullscreenSupport();
        callback({
            isFullscreen,
            type: isFullscreen ? support.type : 'native',
        });
    };

    const handleWebkitFullscreenChange = () => {
        handleFullscreenChange();
    };

    // Standard events
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleWebkitFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // iOS video fullscreen events
    const video = container.querySelector('video');
    if (video) {
        video.addEventListener('webkitbeginfullscreen', handleFullscreenChange);
        video.addEventListener('webkitendfullscreen', handleFullscreenChange);
    }

    // Return cleanup function
    return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleWebkitFullscreenChange);
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        document.removeEventListener('MSFullscreenChange', handleFullscreenChange);

        if (video) {
            video.removeEventListener('webkitbeginfullscreen', handleFullscreenChange);
            video.removeEventListener('webkitendfullscreen', handleFullscreenChange);
        }
    };
}
