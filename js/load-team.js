document.addEventListener('DOMContentLoaded', async () => {
    // Determine where we are
    const teamGrid = document.querySelector('.team-grid');
    const tempTeamContainer = document.querySelector('#team-container-dynamic'); // Helper if we want to replace the list
    const isProfilePage = window.location.pathname.includes('team-member.html');

    // Determine environment
    // If opening file directly (hostname is empty), assume localhost for testing
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '';
    
    // API Base URL
    const API_BASE = isLocalhost ? 'http://127.0.0.1:1337' : 'https://cms.rlcadvocates.co.ke'; 
    const API_URL = `${API_BASE}/api/team-members?populate=*&sort=order:asc`;

    console.log(`RLC Debug: Loading team from ${API_URL}`);

    if (teamGrid) {
        await loadTeamGrid(teamGrid, API_URL, API_BASE);
    }

    if (isProfilePage) {
        await loadTeamProfile(API_BASE);
    }
});

async function loadTeamGrid(container, url, baseUrl) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        const members = data.data;

        if (!members || members.length === 0) {
            container.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">Team members loading...</p>'; 
            return;
        }

        // Clear existing static content if any (optional, or we append)
        container.innerHTML = '';

        members.forEach(member => {
            // Get Image
            const imgUrl = member.photo ? `${baseUrl}${member.photo.url}` : 'Images/owl-ci.png'; // Fallback
            
            const card = document.createElement('div');
            card.className = 'team-card';
            card.setAttribute('data-aos', 'fade-up');
            card.onclick = () => window.location.href = `team-member.html?slug=${member.slug}`;
            card.style.cursor = 'pointer';

            card.innerHTML = `
                <div class="team-img-wrapper">
                    <img src="${imgUrl}" class="team-img" alt="${member.name}">
                </div>
                <div class="team-name">${member.name}</div>
                <div class="team-role">${member.role}</div>
            `;
            container.appendChild(card);
        });

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
        window.location.href = 'index.html'; // Redirect if no slug
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
             bioContent.innerHTML = member.bio || 'No biography available.';
        }

        // Image
        const imgUrl = member.photo ? `${baseUrl}${member.photo.url}` : 'Images/owl-ci.png';
        document.getElementById('member-img').src = imgUrl;

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
