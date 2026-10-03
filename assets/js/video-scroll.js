(() => {
    const videoBox = document.getElementById('video-box');
    const heroText = document.getElementById('hero-text');
    const heroOverlay = document.getElementById('hero-overlay');
    const hero = document.getElementById('hero');
    const video = videoBox?.querySelector('video');
    const fullscreenButton = document.getElementById('video-fullscreen-btn');
    const closeButton = document.getElementById('video-close-btn');
    const navbar = document.getElementById('navbar');
    let previousScrollY = window.scrollY;

    if (!videoBox || !heroText || !heroOverlay || !hero || !video) return;

    const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    const lerp = (a, b, t) => a + (b - a) * t;

    const updateHero = () => {
        const vh = window.innerHeight;
        const vw = document.documentElement.clientWidth;
        const heroTop = hero.getBoundingClientRect().top;
        const isMobile = window.matchMedia('(max-width: 768px)').matches;

        const scrollRange = isMobile ? Math.max(hero.offsetHeight - vh, 1) : vh;
        const progress = Math.min(Math.max(-heroTop / scrollRange, 0), 1);
        const p = Math.min(progress * 2, 1); 

        const navH = navbar ? navbar.offsetHeight : 0;
        const textH = heroText.offsetHeight;          
        const endScale = isMobile ? 0.84 : 0.75;
        const scale = lerp(1, endScale, p);
        const textTopStart = (vh - textH) / 2;
        const textTopEnd = navH + 8;
        const textTop = lerp(textTopStart, textTopEnd, p);
        const textBottomEnd = textTopEnd + textH * endScale;

        const gap = 16;
        const bottomPad = 16;
        const availH = Math.max(vh - textBottomEnd - gap - bottomPad, 120);
        const maxW = vw * (isMobile ? 0.95 : 0.60);
        const targetW = Math.min(maxW, availH * 16 / 9);
        const targetH = targetW * 9 / 16;
        const videoTopEnd = textBottomEnd + gap;

        heroText.style.position = 'absolute';
        heroText.style.left = '0';
        heroText.style.right = '0';
        heroText.style.top = `${textTop}px`;
        heroText.style.transformOrigin = 'top center';
        heroText.style.transform = `scale(${scale})`;
        heroText.style.opacity = 1;
        heroText.style.pointerEvents = 'auto';
        heroOverlay.style.opacity = Math.max(1 - progress * 1.5, 0);

        videoBox.style.left = '50%';
        videoBox.style.transform = 'translateX(-50%)';
        videoBox.style.width = `${lerp(vw, targetW, p)}px`;
        videoBox.style.height = `${lerp(vh, targetH, p)}px`;
        videoBox.style.top = `${lerp(0, videoTopEnd, p)}px`;
        videoBox.style.borderRadius = `${p * (isMobile ? 12 : 20)}px`;
        videoBox.style.boxShadow = `0 20px 50px rgba(0,0,0,.8), 0 0 30px rgba(16,185,129,${p * 0.3})`;
        videoBox.classList.toggle('is-framed', p > 0.35);
    };

    let frameRequested = false;
    const requestUpdate = () => {
        if (frameRequested) return;
        frameRequested = true;
        requestAnimationFrame(() => {
            updateHero();
            frameRequested = false;
        });
    };

    const updateNavigation = () => {
        const y = window.scrollY;
        navbar?.classList.toggle('is-hidden', y > 80 && y > previousScrollY);
        previousScrollY = y;
    };

    window.addEventListener('scroll', () => {
        updateNavigation();
        requestUpdate();
    }, { passive: true });
    window.addEventListener('resize', requestUpdate);
    window.addEventListener('load', requestUpdate);
    document.fonts?.ready.then(requestUpdate);
    if ('ResizeObserver' in window) new ResizeObserver(requestUpdate).observe(heroText);

    const keepVideoPlaying = () => {
        if (!document.hidden && !video.ended) {
            video.muted = true;
            video.play().catch(() => {});
        }
    };
    video.addEventListener('pause', () => setTimeout(keepVideoPlaying, 100));
    document.addEventListener('fullscreenchange', () => setTimeout(keepVideoPlaying, 100));
    document.addEventListener('visibilitychange', () => { if (!document.hidden) keepVideoPlaying(); });
    video.addEventListener('webkitendfullscreen', () => {
        keepVideoPlaying();
        setTimeout(keepVideoPlaying, 200);
        setTimeout(keepVideoPlaying, 500);
    });

    const setFakeFullscreen = (on) => {
        videoBox.classList.toggle('is-fake-fullscreen', on);
        document.body.classList.toggle('video-fs-open', on);
        keepVideoPlaying();
    };

    fullscreenButton?.addEventListener('click', async () => {
        try {
            if (isIOS) {
                setFakeFullscreen(true);
            } else if (document.fullscreenElement) {
                await document.exitFullscreen();
            } else if (video.requestFullscreen) {
                await video.requestFullscreen();
            }
        } catch (e) {
            console.warn('Unable to open video in full screen.', e);
        }
    });

    closeButton?.addEventListener('click', () => setFakeFullscreen(false));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setFakeFullscreen(false);
    });

    keepVideoPlaying();
    updateHero();
})();