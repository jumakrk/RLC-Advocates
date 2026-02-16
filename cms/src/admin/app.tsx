import type { StrapiApp } from '@strapi/strapi/admin';
import Logo from './extensions/logo.png';
import Favicon from './extensions/favicon.png';
import './custom.css';

export default {
    config: {
        head: {
            favicon: Favicon,
        },
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
                    primary100: '#fff0e6', // Lighter orange
                    primary200: '#ffdcb8',
                    primary500: '#FD641F', // Brand Orange
                    primary600: '#e55a1c',
                    primary700: '#cc5019',
                    buttonPrimary500: '#FD641F',
                    buttonPrimary600: '#e55a1c',

                    // Secondary (Blue)
                    secondary100: '#e6f0ff',
                    secondary500: '#0047AB', // Brand Blue
                    secondary600: '#003d91',
                    secondary700: '#00337a',

                    // Override Default Success (Green) to Brand Blue
                    success100: '#e6f0ff',
                    success200: '#b3d1ff',
                    success500: '#0047AB', // Brand Blue (Cobalt)
                    success600: '#003d91',
                    success700: '#00337a',

                    // Revert to Standard Light Theme Neutrals
                    neutral0: '#ffffff',    // Card/Content
                    neutral100: '#f6f6f9',  // Main App Background
                    neutral150: '#eaeaef',
                    neutral200: '#dcdce4',
                    neutral300: '#c0c0cf',
                    neutral400: '#a5a5ba',
                    neutral500: '#8e8ea9',
                    neutral600: '#666687',
                    neutral700: '#4a4a6a',
                    neutral800: '#32324d',
                    neutral900: '#212134',  // Text (Dark)
                    neutral1000: '#151d1d',
                },
            },
            dark: {
                colors: {
                    primary100: '#fff0e6',
                    primary200: '#ffdcb8',
                    primary500: '#FD641F',
                    primary600: '#e55a1c',
                    primary700: '#cc5019',
                    buttonPrimary500: '#FD641F',
                    buttonPrimary600: '#e55a1c',

                    secondary100: '#e6f0ff',
                    secondary500: '#0047AB',
                    secondary600: '#003d91',
                    secondary700: '#00337a',

                    // Override Default Success (Green) to Brand Blue
                    success100: '#e6f0ff',
                    success200: '#b3d1ff',
                    success500: '#0047AB', // Brand Blue (Cobalt)
                    success600: '#003d91',
                    success700: '#00337a',

                    // Force Light Look even in Dark Mode (White Backgrounds)
                    neutral0: '#ffffff',    // Card/Content
                    neutral100: '#f6f6f9',  // Main App Background
                    neutral150: '#eaeaef',
                    neutral200: '#dcdce4',
                    neutral300: '#c0c0cf',
                    neutral400: '#a5a5ba',
                    neutral500: '#8e8ea9',
                    neutral600: '#666687',
                    neutral700: '#4a4a6a',
                    neutral800: '#32324d',
                    neutral900: '#212134',  // Text (Dark)
                    neutral1000: '#151d1d',
                },
            },
        },
    },
    bootstrap(app: StrapiApp) {
        console.log(app);
        
        // Force Orange Outlines via JS Injection (Bulletproof)
        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
            :where(input[type="text"]),
            :where(input[type="email"]),
            :where(input[type="password"]),
            :where(input[type="number"]),
            :where(textarea) {
                border: 1px solid #FD641F !important;
            }
            :where(input:focus), :where(textarea:focus) {
                box-shadow: 0 0 0 2px rgba(253, 100, 31, 0.2) !important;
            }
            /* Force 'order' field to be read-only and hide all buttons inside its container */
            div:has(> input[name="order"]) button,
            div:has(> input[name="order"]) [role="button"],
            input[name="order"] {
                pointer-events: none !important;
                background-color: #f3f3f7 !important;
                cursor: not-allowed !important;
                opacity: 0.7 !important;
                user-select: none !important;
                -moz-appearance: textfield !important;
            }
            input[name="order"]::-webkit-outer-spin-button,
            input[name="order"]::-webkit-inner-spin-button {
                -webkit-appearance: none !important;
                margin: 0 !important;
            }
            /* Hide any sibling div that might contain spin buttons */
            input[name="order"] + div {
                display: none !important;
            }
        `;
        document.head.appendChild(style);

        // Persistent Poller to ensure field stays read-only during view changes
        setInterval(() => {
            const input = document.querySelector('input[name="order"]') as HTMLInputElement;
            if (input && !input.disabled) {
                input.disabled = true;
                input.style.backgroundColor = '#f3f3f7';
                const container = input.closest('div');
                if (container) {
                    const buttons = container.querySelectorAll('button');
                    buttons.forEach(btn => btn.style.display = 'none');
                }
            }
        }, 1000);
    },
};
