(() => {
    const videoBox = document.getElementById('video-box');
    const heroText = document.getElementById('hero-text');
    const heroOverlay = document.getElementById('hero-overlay');
    const hero = document.getElementById('hero');
    const video = videoBox?.querySelector('video');
    const fullscreenButton = document.getElementById('video-fullscreen-btn');
    const navbar = document.getElementById('navbar');
    let previousScrollY = window.scrollY;

    if (!videoBox || !heroText || !heroOverlay || !hero || !video) return;

    const updateHero = () => {
        const viewportHeight = window.innerHeight;
        const heroTop = hero.getBoundingClientRect().top;
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const scrollRange = isMobile
            ? Math.max(hero.offsetHeight - viewportHeight, 1)
            : viewportHeight;
        const progress = Math.min(Math.max(-heroTop / scrollRange, 0), 1);
        const frameWidth = isMobile ? 95 : 75;
        const targetHeight = window.innerWidth * (frameWidth / 100) * 9 / 16;
        const frameHeight = viewportHeight - progress * (viewportHeight - targetHeight);
        const textOpacity = Math.max(1 - progress * 2, 0);

        heroText.style.opacity = textOpacity;
        heroText.style.transform = `translateY(${-progress * (isMobile ? 120 : 300)}px)`;
        heroText.style.pointerEvents = textOpacity === 0 ? 'none' : 'auto';
        heroOverlay.style.opacity = Math.max(1 - progress * 1.5, 0);

        videoBox.style.width = `${100 - progress * (100 - frameWidth)}%`;
        videoBox.style.height = `${frameHeight}px`;
        videoBox.style.borderRadius = `${progress * (isMobile ? 12 : 20)}px`;
        videoBox.style.boxShadow = `0 20px 50px rgba(0, 0, 0, .8), 0 0 30px rgba(16, 185, 129, ${progress * .3})`;
        videoBox.classList.toggle('is-framed', progress > .35);
    };

    let frameRequested = false;
    const requestUpdate = () => {
        if (!frameRequested) {
            window.requestAnimationFrame(() => {
                updateHero();
                frameRequested = false;
            });
            frameRequested = true;
        }
    };

    const updateNavigation = () => {
        const currentScrollY = window.scrollY;
        const isScrollingDown = currentScrollY > previousScrollY;

        if (navbar) {
            navbar.classList.toggle('is-hidden', currentScrollY > 80 && isScrollingDown);
        }

        previousScrollY = currentScrollY;
    };

    window.addEventListener('scroll', () => {
        updateNavigation();
        requestUpdate();
    }, { passive: true });
    window.addEventListener('resize', requestUpdate);

    const keepVideoPlaying = () => {
        if (!document.hidden && !video.ended) {
            video.play().catch(() => {
                // Some mobile browsers wait until the next user interaction to resume playback.
            });
        }
    };

    video.addEventListener('pause', () => window.setTimeout(keepVideoPlaying, 100));
    document.addEventListener('fullscreenchange', () => window.setTimeout(keepVideoPlaying, 100));
    video.addEventListener('webkitendfullscreen', () => window.setTimeout(keepVideoPlaying, 100));
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) keepVideoPlaying();
    });

    fullscreenButton?.addEventListener('click', async () => {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            } else if (video.requestFullscreen) {
                await video.requestFullscreen();
            } else if (video.webkitEnterFullscreen) {
                video.webkitEnterFullscreen();
            }
        } catch (error) {
            console.warn('Unable to open video in full screen.', error);
        }
    });
    keepVideoPlaying();
    updateHero();
})();
