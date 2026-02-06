document.addEventListener('DOMContentLoaded', async () => {
    // --- DOM Elements ---
    const heroContainer = document.getElementById('hero-article-container');
    const recentGrid = document.getElementById('recent-articles-grid');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    // --- LOADER LOGIC ---
    const showLoader = () => {
        const loader = document.createElement('div');
        loader.className = 'loader-container';
        loader.innerHTML = '<div class="loader"></div>';
        document.body.appendChild(loader);
        return Date.now();
    };

    const hideLoader = async (startTime) => {
        const elapsed = Date.now() - startTime;
        const minTime = 1000; // Minimum 1 second display time
        const remaining = minTime - elapsed;
        if (remaining > 0) await new Promise(r => setTimeout(r, remaining));
        
        const loader = document.querySelector('.loader-container');
        if(loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 500);
        }
    };

    // Start loader immediately
    const loaderStartTime = showLoader();

    // --- CONFIG ---
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '';
    const API_BASE = isLocalhost ? 'http://127.0.0.1:1337' : 'https://cms.rlcadvocates.co.ke'; 
    const API_URL = `${API_BASE}/api/articles?populate=*&sort=date:desc`; 

    // --- STATE ---
    let allArticles = [];
    let recentArticles = []; 
    let currentPage = 0;
    const pageSize = 3;

    // --- HELPERS ---
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const getImageUrl = (article) => article.cover?.url ? `${API_BASE}${article.cover.url}` : '../Images/owl-ci.png';

    // --- RENDER FUNCTIONS ---
    
    // 1. Hero (Latest Article)
    const renderHero = (article) => {
        if (!heroContainer) return;
        
        // Check session for animation
        const currentPath = window.location.pathname;
        const hasVisited = sessionStorage.getItem(`visited_${currentPath}`);
        const aosAttr = hasVisited ? '' : 'data-aos="fade-right"';
        const imgAosAttr = hasVisited ? '' : 'data-aos="zoom-in" data-aos-delay="200"';

        heroContainer.innerHTML = `
            <div class="blog-hero" onclick="window.location.href='/article/?slug=${article.slug}'" style="cursor: pointer;">
                <div class="blog-hero-img" ${imgAosAttr}>
                    <img src="${getImageUrl(article)}" alt="${article.title}">
                </div>
                <div class="blog-hero-content" ${aosAttr}>
                    <span class="news-badge">Latest Insight</span>
                    <span class="hero-read-time"><i class="far fa-clock"></i> 5 min read</span>
                    <h1>${article.title}</h1>
                    <p>${article.summary || article.title}</p>
                    <a href="/article/?slug=${article.slug}" class="hero-link">
                        Read More <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
        
        if (typeof AOS !== 'undefined' && !hasVisited) {
            setTimeout(() => AOS.refresh(), 100);
        }
    };

    // 2. Recent Grid (Paginated)
    const renderRecentGrid = () => {
        if (!recentGrid) return;
        recentGrid.innerHTML = '';
        
        const start = currentPage * pageSize;
        const end = start + pageSize;
        const pageArticles = recentArticles.slice(start, end);

        // Check session for animation
        const currentPath = window.location.pathname;
        const hasVisited = sessionStorage.getItem(`visited_${currentPath}`);

        if(pageArticles.length === 0) {
            recentGrid.innerHTML = '<p>No more articles.</p>';
            return;
        }

        pageArticles.forEach((article, index) => {
            // Delay: 0, 100, 200
            const delay = index * 100;
            const aosAttr = hasVisited ? '' : `data-aos="fade-up" data-aos-delay="${delay}"`;

            const html = `
                <div class="blog-card" ${aosAttr} onclick="window.location.href='/article/?slug=${article.slug}'">
                    <div class="blog-img-wrapper">
                        <img src="${getImageUrl(article)}" alt="${article.title}">
                    </div>
                    <div>
                        <div class="author-meta">
                            ${article.author || 'RLC Team'} 
                            <span class="date-meta">${formatDate(article.date || article.publishedAt)}</span>
                        </div>
                        <h3>${article.title}</h3>
                        <p>${article.summary || article.title}</p>
                        <a href="/article/?slug=${article.slug}" class="hero-link">
                           Read More <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            `;
            recentGrid.innerHTML += html;
        });

        if (typeof AOS !== 'undefined' && !hasVisited) {
            setTimeout(() => AOS.refresh(), 100);
        }

        updateControls();
    };

    const updateControls = () => {
        if(prevBtn) prevBtn.disabled = currentPage === 0;
        if(nextBtn) {
            const totalPages = Math.ceil(recentArticles.length / pageSize);
            nextBtn.disabled = currentPage >= totalPages - 1;
        }
    };

    // --- BUTTON LISTENERS ---
    if(prevBtn) {
        prevBtn.addEventListener('click', () => {
            if(currentPage > 0) {
                currentPage--;
                renderRecentGrid();
            }
        });
    }

    if(nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(recentArticles.length / pageSize);
            if(currentPage < totalPages - 1) {
                currentPage++;
                renderRecentGrid();
            }
        });
    }


    // --- INIT ---
    try {
        const response = await fetch(API_URL);
        if(!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        const articles = Array.isArray(data.data) ? data.data : [];

        if (articles.length > 0) {
            allArticles = articles;
            
            // 1. Render Hero (Index 0)
            renderHero(articles[0]);

            // 2. Prepare and Render Recent (The rest)
            if(articles.length > 1) {
                recentArticles = articles.slice(1);
                renderRecentGrid();
            } else {
                if(recentGrid) recentGrid.innerHTML = '<p style="color: grey; grid-column: 1/-1;">No additional articles yet.</p>';
                // Disable next btn if no recent articles
                if(nextBtn) nextBtn.disabled = true;
            }
            
        } else {
            if(heroContainer) heroContainer.innerHTML = '<p>No insights found.</p>';
        }

    } catch (error) {
        console.error('Error fetching articles:', error);
        if(heroContainer) heroContainer.innerHTML = '<p style="color: #ff6b6b;">Unable to load insights. Please check connection.</p>';
    } finally {
        await hideLoader(loaderStartTime);
    }
});
