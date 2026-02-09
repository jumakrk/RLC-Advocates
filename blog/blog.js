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
        const aosAttr = hasVisited ? '' : 'data-aos="fade-left"';
        const imgAosAttr = hasVisited ? '' : 'data-aos="zoom-in" data-aos-delay="200"';

        const category = article.category || 'Legal Insight';

        heroContainer.innerHTML = `
            <div class="bg-white dark:bg-primary/20 rounded-xl overflow-hidden shadow-2xl flex flex-col lg:flex-row min-h-[500px] border border-gray-100 dark:border-gray-800 blog-hero-card cursor-pointer" onclick="window.location.href='/article/?slug=${article.slug}'" ${aosAttr}>
                <div class="lg:w-3/5 relative overflow-hidden">
                    <img src="${getImageUrl(article)}" alt="${article.title}" class="w-full h-full object-cover blog-hero-image" ${imgAosAttr}>
                    <div class="absolute top-6 left-6">
                        <span class="bg-accent-orange text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase shadow-md">Featured Article</span>
                    </div>
                </div>
                <div class="lg:w-2/5 p-8 lg:p-12 flex flex-col justify-center bg-white dark:bg-gray-900">
                    <div class="flex items-center gap-2 mb-4 text-accent-blue font-semibold text-sm">
                        <span class="material-symbols-outlined text-lg">description</span>
                        ${category}
                    </div>
                    <h2 class="text-3xl lg:text-4xl font-extrabold text-primary dark:text-white leading-tight mb-6">
                        ${article.title}
                    </h2>
                    <p class="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8 line-clamp-3">
                        ${article.summary || article.title}
                    </p>
                    <div class="flex items-center gap-4 mb-8">
                        <div class="w-12 h-12 rounded-full bg-accent-blue/10 flex items-center justify-center border border-accent-blue/20">
                            <span class="material-symbols-outlined text-accent-blue">person</span>
                        </div>
                        <div>
                            <p class="font-bold text-primary dark:text-white">${article.author || 'RLC Team'}</p>
                            <p class="text-sm text-gray-500">${formatDate(article.date || article.publishedAt)} • 5 min read</p>
                        </div>
                    </div>
                    <button class="bg-accent-orange text-white px-8 py-4 rounded-lg font-bold hover:bg-orange-600 transition-all flex items-center justify-center gap-2 w-full lg:w-max shadow-xl shadow-accent-orange/20">
                        Read Full Article
                        <span class="material-symbols-outlined">arrow_forward</span>
                    </button>
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
            recentGrid.innerHTML = '<p class="text-center col-span-full py-10 text-gray-500">No more articles.</p>';
            return;
        }

        pageArticles.forEach((article, index) => {
            // Delay: 0, 100, 200
            const delay = index * 100;
            const aosAttr = hasVisited ? '' : `data-aos="fade-up" data-aos-delay="${delay}"`;
            const category = article.category || 'General';

            const html = `
                <article class="group bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-gray-800 flex flex-col cursor-pointer" onclick="window.location.href='/article/?slug=${article.slug}'" ${aosAttr}>
                    <div class="relative overflow-hidden aspect-[16/10]">
                        <img src="${getImageUrl(article)}" alt="${article.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                        <span class="absolute top-4 left-4 bg-accent-blue text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">${category}</span>
                    </div>
                    <div class="p-6 flex flex-col flex-grow">
                        <h3 class="text-xl font-bold text-primary dark:text-white mb-3 group-hover:text-accent-blue transition-colors">
                            ${article.title}
                        </h3>
                        <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                            ${article.summary || article.title}
                        </p>
                        <div class="mt-auto flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-800">
                            <div class="flex items-center gap-3">
                                <div class="size-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                                    <span class="material-symbols-outlined text-gray-500 text-xl">person</span>
                                </div>
                                <span class="text-xs font-bold text-primary dark:text-gray-300 uppercase tracking-tighter">${article.author || 'RLC Team'}</span>
                            </div>
                            <a class="text-accent-orange font-bold text-xs flex items-center gap-1 hover:gap-2 transition-all" href="/article/?slug=${article.slug}">
                                READ MORE <span class="material-symbols-outlined text-sm">arrow_forward</span>
                            </a>
                        </div>
                    </div>
                </article>
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
