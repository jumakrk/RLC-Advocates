document.addEventListener('DOMContentLoaded', async () => {
    const blogGrid = document.querySelector('.blog-grid');
    if (!blogGrid) return;

    // Determine environment
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '';
    const API_BASE = isLocalhost ? 'http://127.0.0.1:1337' : 'https://cms.rlcadvocates.co.ke'; 
    const API_URL = `${API_BASE}/api/articles?populate=*&sort=date:desc&pagination[limit]=3`;

    // Helper: Format Date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    // Helper: Get Image URL
    const getImageUrl = (article) => {
        const url = article.cover?.url;
        return url ? `${API_BASE}${url}` : 'Images/owl-ci.png';
    };

    try {
        blogGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Loading latest insights...</p>';
        
        const response = await fetch(API_URL);
        const data = await response.json();
        const articles = data.data;

        blogGrid.innerHTML = '';

        if (!articles || articles.length === 0) {
            blogGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No articles found.</p>';
            return;
        }

            // Delay for animation
            const delay = index * 100;
            const aosAttr = `data-aos="fade-up" data-aos-delay="${delay}"`;
            
            const cardHtml = `
                <div class="blog-card glass-card" ${aosAttr} onclick="window.location.href='/article/?slug=${article.slug}'" style="cursor: pointer;">
                    <div class="blog-img-wrapper">
                        <img src="${getImageUrl(article)}" alt="${article.title}">
                        <div class="blog-date">${formatDate(article.date || article.publishedAt)}</div>
                    </div>
                    <div class="blog-content">
                        <span class="blog-category">${article.category}</span>
                        <h3>${article.title}</h3>
                        <p>${article.summary || article.title}</p>
                        <a href="/article/?slug=${article.slug}" class="read-more">Read Article <span class="material-symbols-outlined text-sm align-middle">arrow_forward</span></a>
                    </div>
                </div>
            `;
            blogGrid.insertAdjacentHTML('beforeend', cardHtml);
        });
        
        // Refresh AOS just in case (e.g. if we are on first visit and AOS is active)
        if (typeof AOS !== 'undefined') {
            setTimeout(() => AOS.refresh(), 100);
        }

    } catch (error) {
        console.error('Error loading homepage blog:', error);
        blogGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ff6b6b;">Unable to load latest insights.</p>';
    }
});
