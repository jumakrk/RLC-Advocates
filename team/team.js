document.addEventListener('DOMContentLoaded', async () => {
    // Determine where we are
    const teamGrid = document.querySelector('.team-grid');
    const tempTeamContainer = document.querySelector('#team-container-dynamic'); // Helper if we want to replace the list
    // Check if we are in the team directory/page
    const isProfilePage = window.location.pathname.includes('/team/') || window.location.pathname.includes('/team/');

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
        const minimumDuration = 1000; 
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
            card.className = 'group flex flex-col bg-white dark:bg-background-dark border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300';
            
            // Check session for animation
            const currentPath = window.location.pathname;
            const hasVisited = sessionStorage.getItem(`visited_${currentPath}`);
            if (!hasVisited) {
                card.setAttribute('data-aos', 'fade-up');
            }

            // Navigate to ../team/index.html from homepage
            card.onclick = () => window.location.href = `/team/?slug=${member.slug}`;
            card.style.cursor = 'pointer';

            const roleLabel = member.role.includes('Partner') ? 'PARTNER' : (member.role.includes('Associate') ? 'ASSOCIATE' : 'TEAM');

            card.innerHTML = `
                <div class="relative aspect-[4/5] overflow-hidden">
                    <img src="${hasPhoto ? baseUrl + member.photo.url : '../Images/owl-ci.png'}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="${member.name}">
                    <div class="absolute bottom-4 left-4 flex gap-2">
                        <span class="bg-secondary/90 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">${roleLabel}</span>
                    </div>
                </div>
                <div class="p-6 flex flex-col flex-1">
                    <h3 class="text-lg font-bold text-primary dark:text-white group-hover:text-secondary transition-colors">${member.name}</h3>
                    <p class="text-secondary dark:text-blue-400 text-sm font-bold mb-3 uppercase tracking-tight">${member.role}</p>
                    <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">${member.bio_short || member.role}</p>
                    <div class="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <a class="text-xs font-bold text-primary dark:text-gray-300 hover:underline" href="/team/?slug=${member.slug}">View Profile</a>
                        <div class="flex gap-3">
                            <span class="material-symbols-outlined text-gray-400 text-lg hover:text-secondary cursor-pointer">mail</span>
                            <span class="material-symbols-outlined text-gray-400 text-lg hover:text-secondary cursor-pointer">share</span>
                        </div>
                    </div>
                </div>
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

    const gridView = document.getElementById('team-grid-view');
    const profileView = document.getElementById('profile-view');
    const ctaSection = document.getElementById('team-cta');

    if (!slug) {
        if(gridView) gridView.classList.remove('hidden');
        if(profileView) profileView.classList.add('hidden');
        return;
    }

    try {
        // Hide Grid, Show Profile
        if(gridView) gridView.classList.add('hidden');
        if(ctaSection) ctaSection.classList.add('hidden');
        if(profileView) {
            profileView.classList.remove('hidden');
            setTimeout(() => profileView.style.opacity = '1', 50);
        }

        const response = await fetch(`${baseUrl}/api/team-members?filters[slug][$eq]=${slug}&populate=*`);
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            profileView.innerHTML = '<div class="text-center py-20 px-6"><h2 class="text-2xl font-bold">Team Member Not Found</h2><a href="/team/" class="text-accent-blue mt-4 inline-block">Back to Team</a></div>';
            return;
        }

        const member = data.data[0];
        
        // Update Page Title
        document.title = `${member.name} | RLC Advocates`;

        // Render Data
        document.getElementById('member-name').textContent = member.name;
        document.getElementById('member-role').textContent = member.role;
        
        const shortBio = document.getElementById('member-bio-short');
        if(shortBio) shortBio.textContent = member.bio_short || member.role;
        
        // Focus Areas Tags
        const tagsContainer = document.getElementById('member-focus-areas');
        if(tagsContainer && member.focus_areas) {
            const areas = member.focus_areas.split(',').map(a => a.trim());
            tagsContainer.innerHTML = areas.map(area => `<span class="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded text-sm font-semibold border border-slate-200 dark:border-slate-700">${area}</span>`).join('');
        }

        // Bio (Rich Text)
        const bioContent = document.getElementById('member-bio');
        if (Array.isArray(member.bio)) {
             bioContent.innerHTML = member.bio.map(block => {
                if (block.type === 'paragraph') {
                    return `<p>${block.children.map(child => child.text).join('')}</p>`;
                }
                if (block.type === 'heading') {
                    return `<h3>${block.children.map(child => child.text).join('')}</h3>`;
                }
                return '';
             }).join('');
        } else {
             const rawBio = member.bio || 'No biography available.';
             if (typeof marked !== 'undefined') {
                 bioContent.innerHTML = marked.parse(rawBio);
             } else {
                 bioContent.innerHTML = rawBio.replace(/(?:\r\n|\r|\n)/g, '<br>');
             }
        }

        // Image
        const img = document.getElementById('member-img');
        if (img && member.photo && member.photo.url) {
            img.src = `${baseUrl}${member.photo.url}`;
            img.alt = member.name;
        } else if(img) {
            img.src = '../Images/owl-ci.png';
        }

        // Socials
        const socialContainer = document.querySelector('.member-socials');
        if(socialContainer) {
            socialContainer.innerHTML = ''; 
            const socials = [
                { key: 'linkedin_url', icon: 'public', label: 'LinkedIn' },
                { key: 'email', icon: 'mail', label: 'Email' }
            ];

            socials.forEach(social => {
                const val = member[social.key];
                if (val) {
                    const link = document.createElement('a');
                    link.href = social.key === 'email' ? `mailto:${val}` : val;
                    link.className = 'flex items-center gap-2 text-sm hover:text-accent-orange transition-colors';
                    link.innerHTML = `<span class="material-symbols-outlined text-[18px]">${social.icon}</span> ${val.length > 25 ? social.label : val}`;
                    socialContainer.appendChild(link);
                }
            });
        }

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
