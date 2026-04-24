document.addEventListener('DOMContentLoaded', async () => {
    // --- DOM Elements ---
    const featuredContainer = document.getElementById('featured-article-container');
    const recentGrid = document.getElementById('recent-articles-grid');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const searchInput = document.querySelector('input[type="text"]');

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
    // const loaderStartTime = showLoader();
    const loaderStartTime = null;

    // --- CONFIG ---
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '';
    const API_BASE = isLocalhost ? 'http://127.0.0.1:1337' : 'https://cms.rlcadvocates.co.ke'; 
    const API_URL = `${API_BASE}/api/articles?populate=*&sort=date:desc`; 

    // --- STATE ---
    let allArticles = [];
    let recentArticles = []; 
    let currentPage = 0;
    const pageSize = 6; // Increased to 6 for better grid feel
    let activeFilter = null;

    // --- CONFIG ---
    const CATEGORIES = [
        'Corporate Law',
        'Litigation & Dispute',
        'Real Estate',
        'Intellectual Property',
        'Employment',
        'Tax',
        'Commercial'
    ];

    // --- HELPERS ---
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const getImageUrl = (article) => article.cover?.url ? `${API_BASE}${article.cover.url}` : '../Images/blog-placeholder.svg';

    const countMatches = (keyword) => {
        const lowerKey = keyword.toLowerCase();
        return allArticles.filter(article => {
            const title = (article.title || '').toLowerCase();
            const cat = (article.category || '').toLowerCase();
            const summary = (article.summary || '').toLowerCase();
            const body = (article.content || '').toLowerCase(); // Check body if available
            return title.includes(lowerKey) || cat.includes(lowerKey) || summary.includes(lowerKey) || body.includes(lowerKey);
        }).length;
    };

    const getFilteredArticles = () => {
        let filtered = allArticles;

        // 1. Filter by Category
        // 1. Filter by Category (using broad matching to align with countMatches)
        if (activeFilter) {
            const lowerFilter = activeFilter.toLowerCase();
            filtered = filtered.filter(article => {
                const title = (article.title || '').toLowerCase();
                const cat = (article.category || '').toLowerCase();
                const summary = (article.summary || '').toLowerCase();
                const body = (article.content || '').toLowerCase();
                return title.includes(lowerFilter) || cat.includes(lowerFilter) || summary.includes(lowerFilter) || body.includes(lowerFilter);
            });
        }

        // 2. Filter by Search Query
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        if (query) {
             filtered = filtered.filter(article => {
                const title = (article.title || '').toLowerCase();
                const cat = (article.category || '').toLowerCase();
                const summary = (article.summary || '').toLowerCase();
                const body = (article.content || '').toLowerCase();
                return title.includes(query) || cat.includes(query) || summary.includes(query) || body.includes(query);
            });
        }

        // 3. Exclude Featured (only if no filters active)
        if (!activeFilter && !query && filtered.length > 0) {
             return filtered.slice(1);
        }

        return filtered;
    };

    // --- RENDER FUNCTIONS ---
    
    // 1. Sidebar Categories
    const renderSidebarCategories = () => {
        const sidebarList = document.querySelector('aside ul.space-y-3');
        if (!sidebarList) return;

        sidebarList.innerHTML = '';

        CATEGORIES.forEach(cat => {
            const count = countMatches(cat);
            const isConnected = allArticles.length > 0;
            const isActive = activeFilter === cat;

            let activeClass = 'text-gray-600 dark:text-gray-400 group-hover:text-accent-blue';
            let badgeClass = 'bg-gray-100 dark:bg-white/10 text-gray-500';
            let containerClass = 'group cursor-pointer transition-all';
            let hrefAttr = '';
            let badgeHtml = '';

            if (!isConnected) {
                // Backend not connected or no articles
                hrefAttr = 'href="/practice/index.html"';
            } else {
                // Backend is connected
                badgeHtml = `<span class="text-xs px-2 py-1 rounded-full ${badgeClass} transition-colors">${count}</span>`;
                
                if (count === 0) {
                    // Category has 0 posts: grey out and make unclickable
                    activeClass = 'text-gray-400 dark:text-gray-600';
                    badgeClass = 'bg-gray-50 dark:bg-white/5 text-gray-400';
                    containerClass = 'group cursor-not-allowed opacity-60';
                } else if (isActive) {
                    activeClass = 'bg-accent-orange text-white';
                    badgeClass = 'bg-white/20 text-white';
                    containerClass = 'bg-accent-orange rounded-lg shadow-md -mx-2 px-2 py-1 cursor-pointer transition-all';
                }
            }

            const li = document.createElement('li');
            li.innerHTML = `
                <a class="flex items-center justify-between ${containerClass}" ${hrefAttr}>
                    <span class="${activeClass} transition-colors font-medium">${cat}</span>
                    ${badgeHtml}
                </a>
            `;
            
            if (isConnected && count > 0) {
                li.querySelector('a').addEventListener('click', (e) => {
                    e.preventDefault();
                    if (activeFilter === cat) {
                        activeFilter = null; // Toggle off
                        if (featuredContainer) featuredContainer.style.display = 'block';
                    } else {
                        activeFilter = cat; // Toggle on
                        if (featuredContainer) featuredContainer.style.display = 'none';
                    }
                    currentPage = 0; // Reset pagination
                    renderRecentGrid();
                    renderSidebarCategories(); // Re-render to update active styling
                });
            }

            sidebarList.appendChild(li);
        });
    };

    // 2. Featured Article (Latest)
    const renderFeatured = (article) => {
        const featuredContainer = document.getElementById('featured-article-container');
        if (!featuredContainer) return;
        
        const aosAttr = 'data-aos="fade-up"';
        const imageUrl = getImageUrl(article);
        const category = article.category || 'Legal Insight';

        featuredContainer.innerHTML = `
            <div class="group relative overflow-hidden rounded-xl bg-white dark:bg-white/5 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:border-accent-blue/30 transition-all duration-300 cursor-pointer" onclick="window.location.href='/article/?slug=${article.slug}'" ${aosAttr}>
                <div class="relative h-[28rem] lg:h-[38rem] overflow-hidden">
                    <img src="${imageUrl}" alt="${article.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                    
                    <!-- Pulsing Featured Label -->
                    <div class="absolute top-6 left-6 z-10">
                        <span class="inline-block px-4 py-1.5 rounded-full bg-accent-orange text-white text-[10px] font-bold uppercase tracking-widest shadow-lg animate-pulse-orange">
                            Featured
                        </span>
                    </div>

                    <div class="absolute bottom-0 left-0 p-6 md:p-10 w-full md:w-3/4">
                        <span class="inline-block px-3 py-1 rounded bg-white/20 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider mb-4 border border-white/30">
                            ${category}
                        </span>
                        <h2 class="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight group-hover:text-accent-blue transition-colors">
                            ${article.title}
                        </h2>
                        <div class="flex flex-wrap items-center text-gray-300 text-xs sm:text-sm gap-y-3 gap-x-4 md:gap-6">
                            <span class="flex items-center gap-1.5 md:gap-2 whitespace-nowrap"><span class="material-symbols-outlined text-base md:text-lg">calendar_today</span> ${formatDate(article.date || article.publishedAt)}</span>
                            <span class="flex items-center gap-1.5 md:gap-2 whitespace-nowrap"><span class="material-symbols-outlined text-base md:text-lg">person</span> ${article.author || 'RLC Team'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        if (typeof AOS !== 'undefined') {
            setTimeout(() => AOS.refresh(), 100);
        }
    };

    // 3. Recent Grid (Paginated)
    const renderRecentGrid = () => {
        if (!recentGrid) return;
        recentGrid.innerHTML = '';
        
        // Get correct list based on filter
        const listToRender = getFilteredArticles();

        const start = currentPage * pageSize;
        const end = start + pageSize;
        const pageArticles = listToRender.slice(start, end);

        // Check session for animation
        const currentPath = window.location.pathname;

        if(pageArticles.length === 0) {
            const msg = activeFilter 
                ? `No articles found matching "${activeFilter}".` 
                : 'No more articles.';
            recentGrid.innerHTML = `<p class="text-center col-span-full py-10 text-gray-500">${msg}</p>`;
            updateControls(listToRender.length);
            return;
        }

        pageArticles.forEach((article, index) => {
            const delay = index * 100;
            const aosAttr = `data-aos="fade-up" data-aos-delay="${delay}"`;
            const category = article.category || 'General';
            const imageUrl = getImageUrl(article);

            const html = `
                <article class="flex flex-col h-full bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden hover:border-accent-blue/50 transition-colors group cursor-pointer" onclick="window.location.href='/article/?slug=${article.slug}'" ${aosAttr}>
                    <div class="relative h-72 overflow-hidden">
                        <img src="${imageUrl}" alt="${article.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                        <div class="absolute top-4 left-4">
                            <span class="px-3 py-1 rounded bg-accent-orange text-white text-[10px] font-bold uppercase tracking-wide shadow-sm">
                                ${category}
                            </span>
                        </div>
                    </div>
                    <div class="flex flex-col flex-grow p-8">
                        <div class="flex flex-wrap items-center gap-2 mb-4 text-xs text-gray-500 dark:text-gray-400 font-medium">
                            <span class="whitespace-nowrap">${formatDate(article.date || article.publishedAt)}</span>
                            <span class="w-1 h-1 rounded-full bg-gray-400 shrink-0"></span>
                            <span class="whitespace-nowrap">By ${article.author || 'RLC Team'}</span>
                        </div>
                        <h3 class="text-xl font-bold text-primary dark:text-white mb-4 leading-snug group-hover:text-accent-blue transition-colors">
                            ${article.title}
                        </h3>
                        <p class="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-grow line-clamp-3">
                            ${article.summary || article.title}
                        </p>
                        <span class="inline-flex items-center text-accent-blue font-bold text-sm group-hover:gap-2 transition-all">
                            Read Article <span class="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                        </span>
                    </div>
                </article>
            `;
            recentGrid.innerHTML += html;
        });

        if (typeof AOS !== 'undefined') {
            setTimeout(() => AOS.refresh(), 100);
        }

        updateControls(listToRender.length);
    };

    const updateControls = (totalItems) => {
        if(prevBtn) prevBtn.disabled = currentPage === 0;
        if(nextBtn) {
            const totalPages = Math.ceil(totalItems / pageSize);
            nextBtn.disabled = currentPage >= totalPages - 1 || totalPages === 0;
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
            const listToRender = getFilteredArticles();
            const totalPages = Math.ceil(listToRender.length / pageSize);
            if(currentPage < totalPages - 1) {
                currentPage++;
                renderRecentGrid();
            }
        });
    }

    // --- SEARCH LISTENER ---
    if (searchInput) {
        searchInput.addEventListener('input', () => {
             currentPage = 0;
            // Use a small debounce if desired, but for client-side filtering immediate is fine
             renderRecentGrid();
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
            
            // 1. Initial Render
            renderFeatured(articles[0]);
            renderSidebarCategories(); // New: Render Sidebar
            renderRecentGrid();        // New: Render Grid (defaults to slice(1))
            
        } else {
            if(featuredContainer) featuredContainer.innerHTML = '<p>No insights found.</p>';
        }

    } catch (error) {
        console.error('Error fetching articles:', error);
        if(featuredContainer) {
            featuredContainer.innerHTML = `
                <div class="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm" data-aos="fade-up">
                    <div class="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                        <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">wifi_off</span>
                    </div>
                    <h3 class="text-xl font-bold text-primary dark:text-white mb-3">Unable to Load Insights</h3>
                    <p class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8 leading-relaxed">
                        We're having trouble reaching our content server. Please check your connection or try again.
                    </p>
                    <button onclick="window.location.reload()" class="group flex items-center gap-2 bg-primary dark:bg-white text-white dark:text-primary px-8 py-3 rounded-lg font-bold text-sm hover:bg-accent-blue hover:text-white transition-all">
                        <span class="material-symbols-outlined text-lg group-hover:rotate-180 transition-transform duration-500">refresh</span>
                        Retry
                    </button>
                </div>
            `;
        }
        renderSidebarCategories(); 
    } finally {
        await hideLoader(loaderStartTime);
    }
});
