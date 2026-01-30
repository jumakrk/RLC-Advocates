document.addEventListener('DOMContentLoaded', async () => {
    const featuredContainer = document.getElementById('featured-article-container');
    const blogGrid = document.getElementById('full-blog-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');

    const API_URL = 'http://localhost:1337/api/articles?populate=*&sort=date:desc'; 

    let allArticles = [];

    // Helper: Format Date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    // Helper: Get Image URL
    const getImageUrl = (article) => {
        const url = article.cover?.url;
        return url ? `http://localhost:1337${url}` : '../Images/owl-ci.png';
    };

    // Function: Render Featured Article
    const renderFeatured = (article) => {
        if (!article) return;
        
        const html = `
            <div class="featured-card" onclick="window.location.href='../article/index.html?slug=${article.slug}'" style="cursor: pointer;">
                <img src="${getImageUrl(article)}" alt="${article.title}" class="featured-img">
                <div class="featured-content">
                    <span class="featured-badge">${article.category}</span>
                    <h2>${article.title}</h2>
                    <div class="featured-meta"><i class="far fa-calendar"></i> ${formatDate(article.date)}</div>
                    <p>${article.summary}</p>
                    <a href="../article/index.html?slug=${article.slug}" class="btn btn-primary" style="align-self: flex-start; margin-top: auto;">Read Full Article</a>
                </div>
            </div>
        `;
        featuredContainer.innerHTML = html;
    };

    // Function: Render Grid
    const renderGrid = (articles) => {
        blogGrid.innerHTML = '';

        if (articles.length === 0) {
            blogGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 1.2rem;">No insights found in this category.</p>';
            return;
        }

        articles.forEach((article, index) => {
            const delay = index * 100;
            const cardHtml = `
                    <div class="blog-card glass-card" data-aos="fade-up" data-aos-delay="${delay}" onclick="window.location.href='../article/index.html?slug=${article.slug}'" style="cursor: pointer;">
                        <div class="blog-img-wrapper">
                            <img src="${getImageUrl(article)}" alt="${article.title}">
                            <div class="blog-date">${formatDate(article.date)}</div>
                        </div>
                        <div class="blog-content">
                            <div class="blog-category">${article.category}</div>
                            <h3>${article.title}</h3>
                            <p>${article.summary}</p>
                            <a href="../article/index.html?slug=${article.slug}" class="read-more">Read Article <i class="fas fa-arrow-right"></i></a>
                        </div>
                    </div>
            `;
            blogGrid.innerHTML += cardHtml;
        });
    };

    // Init: Fetch and Render
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        const articles = data.data; // Strapi v5: data is array of objects directly

        if (articles.length > 0) {
            allArticles = articles;
            
            // 1. Render Featured (First one)
            renderFeatured(articles[0]);

            // 2. Render Grid (Rest of them)
            renderGrid(articles.slice(1));
        } else {
            featuredContainer.innerHTML = '<p style="color:white;">No insights available yet.</p>';
            blogGrid.innerHTML = '';
        }
    } catch (error) {
        console.error('Error fetching articles:', error);
        featuredContainer.innerHTML = '<p style="color: #ff6b6b;">Unable to load insights.</p>';
        blogGrid.innerHTML = '';
    }

    // Filter Logic
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add to clicked
            btn.classList.add('active');

            const category = btn.getAttribute('data-category');

            if (category === 'all') {
                // Determine if we should show featured + grid slice again?
                // UX Choice: When filtering "All", let's restore the view: 1 featured, rest in grid.
                if (allArticles.length > 0) {
                     // Note: We don't re-render featured here because it never disappears, 
                     // but if we want consistent filtering behavior (where "All" = everything), 
                     // maybe "All" just resets to default state.
                     renderGrid(allArticles.slice(1));
                }
            } else {
                // Filter content
                // UX Decision: Should filtering include the Featured article in the grid if it matches?
                // Or just filter the "Grid" part? 
                // Better UX: Filter EVERYTHING and show in Grid (ignore separate featured block? Or keep featured static?)
                // Let's keep Featured static for visual stability, and only filter the Grid items from the FULL list (excluding featured or including?)
                
                // My Logic: "Real Estate" filter -> Show only Real Estate articles in the grid.
                const filtered = allArticles.slice(1).filter(art => art.category === category);
                // Also check if the featured one is NOT in this category, maybe we should swap it? Too complex.
                // Simple: Just filter the grid list (excluding the 1st article which is featured).
                
                // OR: Filter ALL articles and replace the grid with ALL matches.
                // This allows seeing the featured one in the grid if it matches.
                // Let's try: Filter allArticles (skipping index 0 to avoid duplicates if we kept featured?)
                
                // Current Approach: Static Featured (stays latest), Grid filters the *rest*.
                renderGrid(allArticles.slice(1).filter(art => {
                    // Normalize checking (case insensitive if needed, but Strapi is usually consistent)
                    return art.category === category;
                }));
            }
        });
    });

});
