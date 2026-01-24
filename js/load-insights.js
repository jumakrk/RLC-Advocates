document.addEventListener('DOMContentLoaded', async () => {
    const blogGrid = document.querySelector('.blog-grid');
    if (!blogGrid) return; // Exit if no grid found

    // Check if we are on the full listing page
    const isFullPage = window.location.pathname.includes('blog.html') || document.getElementById('full-blog-grid');
    
    const API_URL = 'http://localhost:1337/api/articles?populate=*&sort=date:desc'; // Sort newest first

    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        let articles = data.data;

        if (articles.length > 0) {
            blogGrid.innerHTML = ''; // Clear loading/static content

            // Limit to 3 on Homepage, Show All on Blog Page
            if (!isFullPage) {
                articles = articles.slice(0, 3);
            }

            articles.forEach((article, index) => {
                const attrs = article; // Strapi v5 logic might differ, assuming flat or .attributes
                // Strapi v5 often returns data as flat objects directly in data array or data[i]
                // If using Strapi 4, it's article.attributes. Let's assume v5/flat based on previous code.
                
                const imageUrl = attrs.cover?.url
                    ? `http://localhost:1337${attrs.cover.url}`
                    : 'Images/owl-ci.png'; // Fallback

                const date = new Date(attrs.date).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                });

                const delay = index * 100; // Stagger animation

                const cardHtml = `
                    <div class="blog-card glass-card" data-aos="fade-up" data-aos-delay="${delay}" onclick="window.location.href='article.html?slug=${attrs.slug}'" style="cursor: pointer;">
                        <div class="blog-img-wrapper">
                            <img src="${imageUrl}" alt="${attrs.title}">
                            <div class="blog-date">${date}</div>
                        </div>
                        <div class="blog-content">
                            <div class="blog-category">${attrs.category}</div>
                            <h3>${attrs.title}</h3>
                            <p>${attrs.summary}</p>
                            <a href="article.html?slug=${attrs.slug}" class="read-more">Read Article <i class="fas fa-arrow-right"></i></a>
                        </div>
                    </div>
                `;
                blogGrid.innerHTML += cardHtml;
            });
        } else {
             blogGrid.innerHTML = '<p style="color:white; text-align:center; grid-column:1/-1;">No articles found.</p>';
        }
    } catch (error) {
        console.error('Error fetching insights:', error);
        // Keep fallback content if any
    }
});
