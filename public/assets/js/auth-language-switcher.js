/**
 * Auth Language Switcher
 * Handles language switching for authentication pages
 */

class AuthLanguageSwitcher {
    constructor() {
        // Get current locale from HTML lang attribute or default to 'prs'
        this.currentLocale = document.documentElement.getAttribute('lang') || 'prs';
        this.availableLocales = {
            'en': {
                name: 'English',
                native: 'English',
                dir: 'ltr'
            },
            'prs': {
                name: 'Dari',
                native: 'دری',
                dir: 'rtl'
            }
        };
        this.translations = {};
        this.init();
    }

    async init() {
        await this.loadTranslations();
        this.createLanguageSwitcher();
        this.updatePageDirection();
        this.translatePage();
    }

    async loadTranslations() {
        try {
            // Load English translations
            const enResponse = await fetch('/api/translations/en');
            const enData = await enResponse.json();
            this.translations.en = enData;

            // Load Dari translations
            const prsResponse = await fetch('/api/translations/prs');
            const prsData = await prsResponse.json();
            this.translations.prs = prsData;
        } catch (error) {
            console.error('Failed to load translations:', error);
        }
    }

    createLanguageSwitcher() {
        const switcherHtml = `
            <div class="language-switcher mb-3">
                <label class="form-label">${this.trans('auth.select_language')}</label>
                <select class="form-control" id="language-select">
                    <option value="en" ${this.currentLocale === 'en' ? 'selected' : ''}>
                        ${this.trans('auth.english')}
                    </option>
                    <option value="prs" ${this.currentLocale === 'prs' ? 'selected' : ''}>
                        ${this.trans('auth.dari')}
                    </option>
                </select>
            </div>
        `;

        // Insert language switcher before the form
        const cardBody = document.querySelector('.card-body');
        if (cardBody) {
            const titleDiv = cardBody.querySelector('.text-center');
            if (titleDiv) {
                titleDiv.insertAdjacentHTML('afterend', switcherHtml);
            }
        }

        // Add event listener
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.switchLanguage(e.target.value);
            });
        }
    }

    async switchLanguage(locale) {
        if (!this.availableLocales[locale]) {
            console.error('Invalid locale:', locale);
            return;
        }

        try {
            // Update server session
            const response = await fetch('/api/locale', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ locale })
            });

            if (response.ok) {
                this.currentLocale = locale;
                this.updatePageDirection();
                this.translatePage();
            }
        } catch (error) {
            console.error('Failed to switch language:', error);
        }
    }

    updatePageDirection() {
        const direction = this.availableLocales[this.currentLocale].dir;
        document.documentElement.setAttribute('dir', direction);
        document.documentElement.setAttribute('lang', this.currentLocale);
        
        // Add/remove RTL class
        if (direction === 'rtl') {
            document.body.classList.add('rtl');
        } else {
            document.body.classList.remove('rtl');
        }
    }

    translatePage() {
        // Detect if this is login or registration page
        const isRegistrationPage = window.location.pathname.includes('register');
        const isLoginPage = window.location.pathname.includes('login');
        
        // Update page title
        if (isRegistrationPage) {
            document.title = this.trans('auth.signup_title');
        } else {
            document.title = this.trans('auth.login_title');
        }

        // Update form title and subtitle
        const titleElement = document.querySelector('h3');
        const subtitleElement = document.querySelector('p');
        
        if (isRegistrationPage) {
            if (titleElement) titleElement.textContent = this.trans('auth.signup_title');
            if (subtitleElement) subtitleElement.textContent = this.trans('auth.signup_subtitle');
        } else {
            if (titleElement) titleElement.textContent = this.trans('auth.login_title');
            if (subtitleElement) subtitleElement.textContent = this.trans('auth.login_subtitle');
        }
        
        // Update form labels
        const nameLabel = document.querySelector('label[for="name"]');
        if (nameLabel) nameLabel.textContent = this.trans('auth.name');
        
        const userNameLabel = document.querySelector('label[for="user_name"]');
        if (userNameLabel) userNameLabel.textContent = this.trans('auth.user_name');
        
        const emailLabel = document.querySelector('label[for="email"]');
        if (emailLabel) emailLabel.textContent = this.trans('auth.email');
        
        const passwordLabel = document.querySelector('label[for="password"]');
        if (passwordLabel) passwordLabel.textContent = this.trans('auth.password');

        // Update submit button
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) {
            if (isRegistrationPage) {
                submitBtn.textContent = this.trans('auth.signup');
            } else {
                submitBtn.textContent = this.trans('auth.signin');
            }
        }

        // Update auth links
        const authLink = document.querySelector('a[href*="register"], a[href*="login"]');
        if (authLink) {
            if (authLink.href.includes('register')) {
                authLink.textContent = this.trans('auth.no_account');
            } else {
                authLink.textContent = this.trans('auth.have_account');
            }
        }

        // Update language switcher label
        const langLabel = document.querySelector('.language-switcher label');
        if (langLabel) {
            langLabel.textContent = this.trans('auth.select_language');
        }

        // Update language options
        const options = document.querySelectorAll('#language-select option');
        if (options.length >= 2) {
            options[0].textContent = this.trans('auth.english');
            options[1].textContent = this.trans('auth.dari');
        }
    }

    updateElementText(selector, text) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = text;
        }
    }

    trans(key, params = {}) {
        if (!this.translations[this.currentLocale]) {
            return key;
        }

        const keys = key.split('.');
        let value = this.translations[this.currentLocale];
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return key;
            }
        }

        // Simple parameter replacement
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            Object.keys(params).forEach(param => {
                value = value.replace(`:${param}`, params[param]);
            });
        }

        return value || key;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthLanguageSwitcher();
});