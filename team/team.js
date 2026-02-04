document.addEventListener('DOMContentLoaded', async () => {
    // Determine where we are
    const teamGrid = document.querySelector('.team-grid');
    const tempTeamContainer = document.querySelector('#team-container-dynamic'); // Helper if we want to replace the list
    // Check if we are in the team directory/page
    const isProfilePage = window.location.pathname.includes('/team/') || window.location.pathname.includes('team/index.html');

    // Determine environment
    // If opening file directly (hostname is empty), assume localhost for testing
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '';
    
    // API Base URL
    const API_BASE = isLocalhost ? 'http://127.0.0.1:1337' : 'https://cms.rlcadvocates.co.ke'; 
    const API_URL = `${API_BASE}/api/team-members?populate=*&sort=order:asc`;

    console.log(`RLC Team JS Loaded (v2.1 - Bio Fix). Env: ${isLocalhost ? 'Local' : 'Prod'}`);
    console.log(`Targeting API: ${API_URL}`);

    // --- LOADER HELPERS ---
    function showGlobalLoader() {
        // 1. Check if Homepage - Abort if true
        const path = window.location.pathname;
        const isProfilePage = document.querySelector('.profile-section') !== null;
        
        // If not explicit team page AND not profile section, assume homepage widget and skip global loader
        if (!path.includes('team') && !isProfilePage) {
             return null; 
        }

        // 2. Find Content Container (to respect Header/Footer)
        const targetContainer = document.querySelector('.profile-section') || document.querySelector('section#team .container') || document.querySelector('.team-grid') || document.body;
        
        // Ensure container is relative so absolute loader works
        if(targetContainer !== document.body) {
            targetContainer.style.position = 'relative';
            if(targetContainer.offsetHeight < 300) {
                 targetContainer.style.minHeight = '60vh'; // Force space
            }
        }

        let loader = targetContainer.querySelector('.loader-container');
        if (!loader) {
            loader = document.createElement('div');
            loader.className = 'loader-container';
            loader.innerHTML = '<div class="loader"></div>';
            targetContainer.appendChild(loader);
        }
        loader.classList.remove('hidden');
        return Date.now();
    }

    async function hideGlobalLoader(startTime) {
        if (!startTime) return; // If loader was skipped

        const elapsed = Date.now() - startTime;
        const minimumDuration = 3000; 
        const remaining = minimumDuration - elapsed;
        
        if (remaining > 0) {
            await new Promise(r => setTimeout(r, remaining));
        }
        
        // We need to find the loader again - searching broadly or storing ref?
        // Searching broadly is safer
        const loaders = document.querySelectorAll('.loader-container');
        loaders.forEach(l => l.classList.add('hidden'));
    }

    // --- MAIN ---
    
    const loaderStartTime = showGlobalLoader();

    try {
        if (teamGrid) {
            // No local loader, strictly global for now as per "middle of the page" request
            // But we might want to keep the grid clean
            await loadTeamGrid(teamGrid, API_URL, API_BASE);
        }

        if (isProfilePage) {
            await loadTeamProfile(API_BASE);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await hideGlobalLoader(loaderStartTime);
    }
});

async function loadTeamGrid(container, url, baseUrl) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        const members = data.data;

        if (!members || members.length === 0) {
            // Container empty state handled by hiding loader, maybe show "No members found" text if needed
             // but strictly, we just return to avoid errors
             return;
        }

        // Clear existing static content if any (optional, or we append)
        container.innerHTML = '';

        members.forEach(member => {
            // Get Image or Placeholder
            const hasPhoto = member.photo && member.photo.url;
            let imgContent;
            
            if (hasPhoto) {
                imgContent = `<img src="${baseUrl}${member.photo.url}" class="team-img" alt="${member.name}">`;
            } else {
                imgContent = `<div class="team-avatar-placeholder"><i class="fas fa-user"></i></div>`;
            }
            
            const card = document.createElement('div');
            card.className = 'team-card';
            
            // Check session for animation
            const currentPath = window.location.pathname;
            const hasVisited = sessionStorage.getItem(`visited_${currentPath}`);
            if (!hasVisited) {
                card.setAttribute('data-aos', 'fade-up');
            }

            // Navigate to ../team/index.html from homepage
            card.onclick = () => window.location.href = `../team/index.html?slug=${member.slug}`;
            card.style.cursor = 'pointer';

            card.innerHTML = `
                <div class="team-img-wrapper">
                    ${imgContent}
                </div>
                <div class="team-name">${member.name}</div>
                <div class="team-role">${member.role}</div>
            `;
            container.appendChild(card);
        });
        
        if (typeof AOS !== 'undefined') setTimeout(() => AOS.refresh(), 100);

        // Preload images for smoother transition to profile page
        preloadTeamImages(members, baseUrl);

    } catch (error) {
        console.error('Error loading team:', error);
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #ff6b6b;">
            Unable to load team members.<br>
            <small>(${error.message})</small><br>
            <small>Ensure Strapi is running and Permissions are set to Public.</small>
        </p>`;
    }
}

async function loadTeamProfile(baseUrl) {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    if (!slug) {
        window.location.href = '../index.html'; // Redirect to home
        return;
    }

    try {
        const response = await fetch(`${baseUrl}/api/team-members?filters[slug][$eq]=${slug}&populate=*`);
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            document.querySelector('.profile-container').innerHTML = '<h2>Team Member Not Found</h2>';
            return;
        }

        const member = data.data[0];
        
        // Update Page Title
        document.title = `${member.name} - RLC Advocates`;

        // Render Data
        document.getElementById('member-name').textContent = member.name;
        document.getElementById('member-role').textContent = member.role;
        
        // Bio (Rich Text)
        // Simple Markdown rendering or block rendering needed? 
        // Strapi v5 sends blocks usually. We might need a renderer. 
        // For now, assuming simple text or HTML if the user enters it, or basic blocks.
        // If it's rich text (blocks), we need a parser. Let's try to just dump it for now or assume user types paragraphs.
        // Actually, let's use a helper to render blocks if possible or just JSON.stringify for debug
        // BUT v5 usually uses Blocks. 
        const bioContent = document.getElementById('member-bio');
        // Simple block renderer logic
        if (Array.isArray(member.bio)) {
             bioContent.innerHTML = member.bio.map(block => {
                if (block.type === 'paragraph') {
                    return `<p>${block.children.map(child => child.text).join('')}</p>`;
                }
                return '';
             }).join('');
        } else {
             // Parse Markdown String
             const rawBio = member.bio || 'No biography available.';
             if (typeof marked !== 'undefined') {
                 bioContent.innerHTML = marked.parse(rawBio);
             } else {
                 // Fallback: Convert all newline types to breaks
                 console.warn('Marked.js not found. Using simple fallback.');
                 bioContent.innerHTML = rawBio.replace(/(?:\r\n|\r|\n)/g, '<br>');
             }
        }

        // Image
        const imgWrapper = document.querySelector('.profile-img-wrapper');
        if (member.photo && member.photo.url) {
            imgWrapper.innerHTML = `<img id="member-img" src="${baseUrl}${member.photo.url}" class="profile-img" alt="${member.name}">`;
        } else {
            imgWrapper.innerHTML = `<div class="profile-avatar-placeholder"><i class="fas fa-user"></i></div>`;
        }

        // Socials
        const socialContainer = document.querySelector('.member-socials');
        socialContainer.innerHTML = ''; // Clear defaults

        const socials = [
            { key: 'linkedin_url', icon: 'fab fa-linkedin', label: 'LinkedIn' },
            { key: 'facebook_url', icon: 'fab fa-facebook', label: 'Facebook' },
            { key: 'twitter_url', icon: 'fab fa-x-twitter', label: 'X (Twitter)' },
            { key: 'instagram_url', icon: 'fab fa-instagram', label: 'Instagram' }
        ];

        socials.forEach(social => {
            if (member[social.key]) {
                const link = document.createElement('a');
                link.href = member[social.key];
                link.target = '_blank';
                link.className = 'social-icon-btn';
                link.innerHTML = `<i class="${social.icon}"></i>`;
                socialContainer.appendChild(link);
            }
        });

    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

/**
 * Preload images to browser cache so they appear instantly on the profile page
 */
function preloadTeamImages(members, baseUrl) {
    if (!members || members.length === 0) return;

    // Use requestIdleCallback if available to not block main thread
    const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 2000));

    idleCallback(() => {
        console.log('RLC Debug: Preloading team images via JS Cache...');
        members.forEach(member => {
            if (member.photo && member.photo.url) {
                const img = new Image();
                img.src = `${baseUrl}${member.photo.url}`;
            }
        });
    });
}
