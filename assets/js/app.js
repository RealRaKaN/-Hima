const translations = window.HimaTranslations;
function setLanguage(lang) {
    const t = translations[lang];
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });
    
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (t[key]) el.innerHTML = t[key];
    });
    
    document.getElementById('lang-toggle').textContent = lang === 'ar' ? 'English' : 'عربي';
    localStorage.setItem('hima-lang', lang);
    lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    let savedLang = localStorage.getItem('hima-lang');
    if (!savedLang) {
        const navLang = navigator.language || navigator.userLanguage;
        savedLang = navLang.startsWith('ar') ? 'ar' : 'en';
    }
    setLanguage(savedLang);
});

document.getElementById('lang-toggle').addEventListener('click', () => {
    const currentLang = document.documentElement.lang;
    setLanguage(currentLang === 'en' ? 'ar' : 'en');
});

// Animations & Interactive Controls
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

const mobileToggle = document.getElementById('mobile-toggle');
const navContainer = document.querySelector('.nav-container');

mobileToggle.addEventListener('click', () => {
    navContainer.classList.toggle('active');
    mobileToggle.setAttribute('aria-expanded', navContainer.classList.contains('active'));
});


document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navContainer.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
    });
});

const metricObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const valueEl = entry.target.querySelector('.metric-value.counter');
            if (valueEl && !valueEl.classList.contains('counted')) {
                const target = parseInt(valueEl.getAttribute('data-target'));
                const prefix = valueEl.getAttribute('data-prefix') || '';
                const suffix = valueEl.getAttribute('data-suffix') || '';
                let current = 0;

                const increment = target / 40; 

                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        valueEl.textContent = prefix + target + suffix;
                        valueEl.classList.add('counted');  
                        clearInterval(timer);
                    } else {
                        valueEl.textContent = prefix + Math.ceil(current) + suffix;
                    }
                }, 30);
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.metric-card').forEach(card => metricObserver.observe(card));

