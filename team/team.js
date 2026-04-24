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
    
    const loaderStartTime = null; // showGlobalLoader();

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

let allMembers = [];
let currentBaseUrl = '';

async function loadTeamGrid(container, url, baseUrl) {
    currentBaseUrl = baseUrl;
    
    // Always initialize filters if we have a team grid
    initFilters(container);

    try {
        const response = await fetch(url);
        const data = await response.json();
        allMembers = data.data;

        if (!allMembers || allMembers.length === 0) {
             return;
        }

        // Initial Render
        renderMembers(container, allMembers, baseUrl);
        
        if (typeof AOS !== 'undefined') {
            setTimeout(() => AOS.refresh(), 100);
        }

        // Preload images
        preloadTeamImages(allMembers, baseUrl);

    } catch (error) {
        console.error('Error loading team:', error);
        
        // MOCK DATA FOR VERIFICATION/LOCAL TESTING
        const mockMembers = [
            {
                name: "Alex Sterling",
                role: "Managing Partner",
                slug: "alex-sterling",
                focus_areas: "Corporate, International Arbitration",
                bio_short: "Specializing in high-stakes corporate litigation and international arbitration with over 15 years of experience.",
                photo: null
            },
            {
                name: "Sarah Jenkins",
                role: "Senior Associate",
                slug: "sarah-jenkins",
                focus_areas: "Intellectual Property, Technology",
                bio_short: "Expert in intellectual property rights and technology law, helping startups navigate complex legal landscapes.",
                photo: null
            },
            {
                name: "Marcus Thorne",
                role: "Legal Counsel",
                slug: "marcus-thorne",
                focus_areas: "Real Estate, Commercial Leasing",
                bio_short: "Focused on real estate transactions and commercial leasing for multinational corporations.",
                photo: null
            }
        ];

        console.log('Rendering mock data for local verification...');
        allMembers = mockMembers; // Populate for filtering
        renderMembers(container, mockMembers, baseUrl);
    }
}

function initFilters(container) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state UI
            filterBtns.forEach(b => {
                b.classList.remove('text-accent-orange', 'border-b-2', 'border-accent-orange', 'pb-1', 'font-bold');
                b.classList.add('text-gray-600', 'dark:text-gray-400', 'hover:text-primary', 'dark:hover:text-white', 'font-semibold');
            });
            btn.classList.add('text-accent-orange', 'border-b-2', 'border-accent-orange', 'pb-1', 'font-bold');
            btn.classList.remove('text-gray-600', 'dark:text-gray-400', 'hover:text-primary', 'dark:hover:text-white', 'font-semibold');

            const filter = btn.getAttribute('data-filter');
            let filtered;
            
            if (filter === 'all') {
                filtered = allMembers;
            } else {
                filtered = allMembers.filter(m => {
                    if (!m.focus_areas) return false;
                    // Support comma separated strings or exact match
                    const areas = m.focus_areas.split(',').map(a => a.trim().toLowerCase());
                    return areas.includes(filter.toLowerCase());
                });
            }

            // Render with a small fade transition for premium feel
            container.style.opacity = '0.3';
            setTimeout(() => {
                renderMembers(container, filtered, currentBaseUrl);
                container.style.opacity = '1';
                if (typeof AOS !== 'undefined') AOS.refresh();
            }, 200);
        });
    });
}

function renderMembers(container, members, baseUrl) {
    container.innerHTML = '';

    if (!members || members.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-20 text-center" data-aos="fade-up">
                <p class="text-gray-500 dark:text-gray-400">No professionals found in this department.</p>
            </div>
        `;
        return;
    }

    members.forEach(member => {
        const hasPhoto = member.photo && member.photo.url;
        
        const card = document.createElement('div');
        card.className = 'group flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500';
        
        if (typeof AOS !== 'undefined') {
            card.setAttribute('data-aos', 'fade-up');
        }

        card.onclick = () => {
            window.location.href = `/team/?slug=${member.slug}`;
        };
        card.style.cursor = 'pointer';

        let roleLabel = member.role || 'TEAM';
        if (roleLabel.toLowerCase().includes('managing partner')) {
            roleLabel = 'MANAGING PARTNER';
        } else if (roleLabel.length > 20) {
            if (roleLabel.toLowerCase().includes('partner')) roleLabel = 'PARTNER';
            else if (roleLabel.toLowerCase().includes('advocate')) roleLabel = 'ADVOCATE';
        }

        card.innerHTML = `
            <div class="relative aspect-[4/5] overflow-hidden">
                <img src="${hasPhoto ? baseUrl + member.photo.url : '../Images/avatar-placeholder.svg'}" 
                     class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
                     alt="${member.name}">
                
                <div class="team-card-overlay absolute inset-0 flex flex-col justify-end p-6">
                </div>

                <div class="absolute top-4 left-4">
                    <span class="glass-card text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                        ${roleLabel}
                    </span>
                </div>
            </div>

            <div class="p-8 flex flex-col flex-1">
                <h3 class="text-xl font-black text-primary dark:text-white mb-1 group-hover:text-accent-blue transition-colors duration-300">
                    ${member.name}
                </h3>
                <p class="text-accent-orange text-xs font-bold mb-4 uppercase tracking-widest">
                    ${member.role}
                </p>
                <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8 line-clamp-3">
                    ${member.bio_short || member.role}
                </p>
                
                <div class="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div class="view-profile-btn group/btn flex items-center gap-2 text-xs font-black text-primary dark:text-white uppercase tracking-widest hover:text-accent-blue transition-colors">
                        View Full Profile
                        <span class="arrow-icon material-symbols-outlined text-[18px]">arrow_forward</span>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
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
        const skeleton = document.getElementById('profile-skeleton');
        const content = document.getElementById('profile-content');
        
        // Hide Grid, Show Profile with Skeleton
        if(gridView) gridView.classList.add('hidden');
        if(ctaSection) ctaSection.classList.add('hidden');
        if(profileView) {
            profileView.classList.remove('hidden');
            if(skeleton) skeleton.classList.remove('hidden');
            if(content) content.classList.add('hidden');
            setTimeout(() => profileView.style.opacity = '1', 50);
        }

        const fetchStartTime = Date.now();
        const response = await fetch(`${baseUrl}/api/team-members?filters[slug][$eq]=${slug}&populate=*`);
        const data = await response.json();
        
        // Ensure skeleton stays visible for at least 800ms for visual consistency
        const elapsed = Date.now() - fetchStartTime;
        if (elapsed < 800) {
            await new Promise(r => setTimeout(r, 800 - elapsed));
        }

        if (!data.data || data.data.length === 0) {
            profileView.innerHTML = '<div class="text-center py-20 px-6"><h2 class="text-2xl font-bold">Team Member Not Found</h2><a href="/team/" class="text-accent-blue mt-4 inline-block">Back to Team</a></div>';
            return;
        }

        const member = data.data[0];
        
        // Switch Skeleton to Content
        if(skeleton) skeleton.classList.add('hidden');
        if(content) content.classList.remove('hidden');
        
        // Update Page Title
        document.title = `${member.name} | RLC Advocates`;

        // 1. Basic Info
        document.getElementById('member-name').textContent = member.name;
        document.getElementById('member-role').textContent = member.role;
        
        const shortBio = document.getElementById('member-bio-short');
        if(shortBio) {
            if (member.bio_short) {
                shortBio.textContent = member.bio_short;
                shortBio.classList.remove('hidden');
            } else {
                shortBio.classList.add('hidden');
            }
        }
        
        // 2. Focus Areas Tags
        const tagsContainer = document.getElementById('member-focus-areas');
        if(tagsContainer) {
            if (member.focus_areas) {
                const areas = member.focus_areas.split(',').map(a => a.trim());
                tagsContainer.innerHTML = areas.map(area => `<span class="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded text-sm font-semibold border border-slate-200 dark:border-slate-700">${area}</span>`).join('');
                tagsContainer.classList.remove('hidden');
            } else {
                tagsContainer.classList.add('hidden');
            }
        }

        // 3. Biography (Rich Text)
        const bioContent = document.getElementById('member-bio');
        const bioSec = document.getElementById('section-bio');
        if (bioSec) {
            const hasBio = member.bio && (Array.isArray(member.bio) ? member.bio.length > 0 : member.bio.trim().length > 0);
            if (hasBio) {
                bioSec.classList.remove('hidden');
                if (Array.isArray(member.bio)) {
                    // Strapi 5 / Blocks format
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
                    const rawBio = member.bio;
                    if (typeof marked !== 'undefined') {
                        bioContent.innerHTML = marked.parse(rawBio);
                    } else {
                        bioContent.innerHTML = rawBio.replace(/(?:\r\n|\r|\n)/g, '<br>');
                    }
                }
            } else {
                bioSec.classList.add('hidden');
            }
        }

        // 4. Image
        const img = document.getElementById('member-img');
        if (img && member.photo && member.photo.url) {
            img.src = `${baseUrl}${member.photo.url}`;
            img.alt = member.name;
        } else if(img) {
            img.src = '../Images/avatar-placeholder.svg';
        }

        // 5. Contact Info (Email, Phone)
        const contactContainer = document.querySelector('.member-contacts');
        if(contactContainer) {
            contactContainer.innerHTML = '';
            const contacts = [
                { key: 'email', icon: 'mail', label: 'Email' },
                { key: 'phone_number', icon: 'call', label: 'Phone' }
            ];

            let hasAnyContact = false;
            contacts.forEach(contact => {
                const val = member[contact.key];
                if (val) {
                    hasAnyContact = true;
                    const link = document.createElement('a');
                    link.href = contact.key === 'email' ? `mailto:${val}` : `tel:${val}`;
                    link.className = 'flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-accent-orange transition-colors p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5';
                    link.innerHTML = `<span class="material-symbols-outlined text-[20px] text-accent-blue">${contact.icon}</span> ${val}`;
                    contactContainer.appendChild(link);
                }
            });
            
            // Hide parent connect section if no contacts
            const connectHeader = contactContainer.previousElementSibling;
            if (connectHeader) connectHeader.style.display = hasAnyContact ? 'block' : 'none';
        }

        // 6. Social Grid
        const socialGrid = document.getElementById('member-socials-grid');
        if(socialGrid) {
            socialGrid.innerHTML = '';
            const branding = {
                linkedin_url: { color: 'hover:bg-[#0077b5]', path: '<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>' },
                twitter_url: { color: 'hover:bg-black dark:hover:bg-white dark:hover:text-black', path: '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>' },
                facebook_url: { color: 'hover:bg-[#1877F2]', path: '<path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.797 1.66-2.797 3.54v1.065h4.512l-.58 3.667h-3.932v7.98h-5.017z"/>' },
                instagram_url: { color: 'hover:bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]', path: '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.225-.149-4.771-1.664-4.919-4.919-.058-1.265-.069-1.644-.069-4.849 0-3.204.012-3.584.069-4.849.149-3.228 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>' },
            };

            const socialKeys = ['linkedin_url', 'facebook_url', 'instagram_url', 'twitter_url'];
            let hasAnySocial = false;
            socialKeys.forEach(key => {
                if (member[key]) {
                    hasAnySocial = true;
                    const brand = branding[key];
                    if(brand) {
                        const link = document.createElement('a');
                        link.href = member[key];
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                        link.className = `flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-white dark:text-gray-400 transition-all shadow-sm ${brand.color}`;
                        link.innerHTML = `<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">${brand.path}</svg>`;
                        socialGrid.appendChild(link);
                    }
                }
            });
            
            // Hide parent social section if no socials
            const socialSecParent = socialGrid.parentElement;
            if (socialSecParent) socialSecParent.style.display = hasAnySocial ? 'block' : 'none';
        }

        // 7. Key Achievements
        const hasAchievements = member.achievements && (Array.isArray(member.achievements) ? member.achievements.length > 0 : member.achievements.trim().length > 0);
        const achievementsSec = document.getElementById('section-achievements');
        if (achievementsSec) {
            if (hasAchievements) {
                achievementsSec.classList.remove('hidden');
                renderRichText('member-achievements', member.achievements);
            } else {
                achievementsSec.classList.add('hidden');
            }
        }

        // 8. Education & Admissions Grid
        const hasEducation = member.education && (Array.isArray(member.education) ? member.education.length > 0 : member.education.trim().length > 0);
        const hasAdmissions = member.bar_admissions && (Array.isArray(member.bar_admissions) ? member.bar_admissions.length > 0 : member.bar_admissions.trim().length > 0);
        
        const educationSec = document.getElementById('section-education');
        const admissionsSec = document.getElementById('section-admissions');
        const eduAdmGrid = document.getElementById('grid-edu-adm');

        if (educationSec) {
            if (hasEducation) {
                educationSec.classList.remove('hidden');
                renderRichText('member-education', member.education);
            } else {
                educationSec.classList.add('hidden');
            }
        }

        if (admissionsSec) {
            if (hasAdmissions) {
                admissionsSec.classList.remove('hidden');
                renderRichText('member-admissions', member.bar_admissions);
            } else {
                admissionsSec.classList.add('hidden');
            }
        }

        if (eduAdmGrid) {
            if (!hasEducation && !hasAdmissions) {
                eduAdmGrid.classList.add('hidden');
            } else {
                eduAdmGrid.classList.remove('hidden');
                // Adjust columns based on presence
                if (hasEducation && hasAdmissions) {
                    eduAdmGrid.classList.add('md:grid-cols-2');
                } else {
                    eduAdmGrid.classList.remove('md:grid-cols-2');
                }
            }
        }

    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

/**
 * Helper for rendering Rich Text or Strapi Blocks
 */
function renderRichText(elementId, data) {
    const el = document.getElementById(elementId);
    if (!el || !data) return;

    if (Array.isArray(data)) {
         // Blocks format
         el.innerHTML = data.map(block => {
            if (block.type === 'paragraph') {
                return `<p>${block.children.map(child => child.text).join('')}</p>`;
            }
            if (block.type === 'heading') {
                return `<h3 class="text-lg font-bold mt-4 mb-2 text-primary dark:text-white">${block.children.map(child => child.text).join('')}</h3>`;
            }
            if (block.type === 'list') {
                const tag = block.format === 'ordered' ? 'ol' : 'ul';
                const listClass = block.format === 'ordered' ? 'list-decimal pl-5 space-y-2 marker:text-accent-blue font-medium' : 'space-y-3';
                
                return `<${tag} class="${listClass}">
                    ${block.children.map(item => {
                        const text = item.children.map(c => c.text).join('');
                        if(block.format !== 'ordered') {
                            return `<li class="flex gap-3 items-start">
                                <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-orange shrink-0"></span>
                                <span class="leading-relaxed">${text}</span>
                            </li>`;
                        }
                        return `<li>${text}</li>`;
                    }).join('')}
                </${tag}>`;
            }
            return '';
         }).join('');
    } else {
         // Markdown or plain text
         if (typeof marked !== 'undefined') {
             el.innerHTML = marked.parse(data);
         } else {
             let raw = data;
             raw = raw.replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest mt-4 mb-2">$1</h3>');
             raw = raw.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-primary dark:text-white">$1</strong>');
             raw = raw.replace(/\*(.*?)\*/gim, '<em class="italic text-gray-500">$1</em>');
             if (raw.includes('- ')) {
                const lines = raw.split('\n');
                const processed = lines.map(line => {
                    if(line.trim().startsWith('- ')) {
                        const content = line.replace(/^- /, '').trim();
                        return `<li class="flex gap-3 items-start"><span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-orange shrink-0"></span><span class="leading-relaxed">${content}</span></li>`;
                    }
                    return line ? `<p class="mb-2">${line}</p>` : '';
                }).join('');
                el.innerHTML = `<ul class="space-y-3">${processed}</ul>`;
             } else {
                el.innerHTML = raw.replace(/(?:\r\n|\r|\n)/g, '<br>');
             }
         }
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
