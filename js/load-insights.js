document.addEventListener('DOMContentLoaded', async () => {
    const blogGrid = document.querySelector('.blog-grid');
    if (!blogGrid) return; // Exit if not on homepage

    const API_URL = 'http://localhost:1337/api/articles?populate=*';

    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        const articles = data.data;

        if (articles.length > 0) {
            blogGrid.innerHTML = ''; // Clear hardcoded content

            articles.forEach((article, index) => {
                const attrs = article; // Strapi v5 structure
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
        }
    } catch (error) {
        console.error('Error fetching insights:', error);
        // Fallback: keep hardcoded content if API fails
    }
});
