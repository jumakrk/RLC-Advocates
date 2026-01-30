import type { StrapiApp } from '@strapi/strapi/admin';
import Logo from './extensions/logo.png';
import './custom.css';

export default {
    config: {
        auth: {
            logo: Logo,
        },
        menu: {
            logo: Logo,
        },
        translations: {
            en: {
                'app.components.LeftMenu.navbrand.title': 'RLC Dashboard',
                'app.components.LeftMenu.navbrand.workplace': 'Admin Panel',
                'Auth.form.welcome.title': 'Welcome to RLC Advocates',
                'Auth.form.welcome.subtitle': 'Log in to manage your legal content',
            },
        },
        theme: {
            // Apply the same "Dark Green" scale to BOTH Light and Dark themes to force the look
            light: {
                colors: {
                    primary100: '#fdf0e7',
                    primary200: '#fbdccf',
                    primary300: '#ffbca6',
                    primary400: '#fa9d7d',
                    primary500: '#e36414',
                    primary600: '#cc5a12',
                    primary700: '#b55010',
                    buttonPrimary100: '#fdf0e7',
                    buttonPrimary500: '#e36414',
                    buttonPrimary600: '#cc5a12',

                    // Override Secondary just in case Loader uses it
                    secondary100: '#fdf0e7',
                    secondary200: '#fbdccf',
                    secondary300: '#ffbca6',
                    secondary400: '#fa9d7d',
                    secondary500: '#e36414',
                    secondary600: '#cc5a12',
                    secondary700: '#b55010',

                    // FORCE DARK MODE LOOK: Low neutrals = Dark Backgrounds
                    neutral0: '#162b2b',    // Content/Card Background (Lighter Green)
                    neutral100: '#0d1e1e',  // Main App Background (Dark Green)
                    neutral150: '#0d1e1e',
                    neutral200: '#162b2b',
                    neutral300: '#2a4040',
                    neutral400: '#4b6666',
                    neutral500: '#6e8585',
                    neutral600: '#95b3b3',
                    neutral700: '#b9cccc',
                    neutral800: '#dce5e5',
                    neutral900: '#ffffff',  // Text (White)
                    neutral1000: '#ffffff',
                },
            },
            dark: {
                colors: {
                    primary100: '#fdf0e7',
                    primary200: '#fbdccf',
                    primary300: '#ffbca6',
                    primary400: '#fa9d7d',
                    primary500: '#e36414',
                    primary600: '#cc5a12',
                    primary700: '#b55010',
                    buttonPrimary100: '#fdf0e7',
                    buttonPrimary500: '#e36414',
                    buttonPrimary600: '#cc5a12',

                    // Override Secondary for Dark Mode too
                    secondary100: '#fdf0e7',
                    secondary200: '#fbdccf',
                    secondary300: '#ffbca6',
                    secondary400: '#fa9d7d',
                    secondary500: '#e36414',
                    secondary600: '#cc5a12',
                    secondary700: '#b55010',

                    // Identical Scale for Dark Mode
                    neutral0: '#162b2b',    // Content/Card Background
                    neutral100: '#0d1e1e',  // Main App Background
                    neutral150: '#0d1e1e',
                    neutral200: '#162b2b',
                    neutral300: '#2a4040',
                    neutral400: '#4b6666',
                    neutral500: '#6e8585',
                    neutral600: '#95b3b3',
                    neutral700: '#b9cccc',
                    neutral800: '#dce5e5',
                    neutral900: '#ffffff',  // Text
                    neutral1000: '#ffffff',
                },
            },
        },
        tutorials: false,
        notifications: { release: false },
    },
    bootstrap(app: StrapiApp) {
        console.log(app);
    },
};
