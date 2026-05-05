/* Practice Area Card Expansion Logic - Refined for Efficiency and Visibility */

document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.service-card');
    const overlay = document.createElement('div');
    overlay.className = 'practice-overlay';
    document.body.appendChild(overlay);

    let activeCard = null;

    cards.forEach(card => {
        // Add expansion hint if not already present in HTML
        if (!card.querySelector('.expand-hint')) {
            const hint = document.createElement('div');
            hint.className = 'expand-hint';
            hint.innerHTML = '<span>View Details</span><span class="material-symbols-outlined" style="font-size:16px">open_in_full</span>';
            card.appendChild(hint);
        }

        card.addEventListener('click', () => {
            expandCard(card);
        });
    });

    async function expandCard(card) {
        if (activeCard) return;

        // 1. FIRST: Capture states
        const cardBounds = card.getBoundingClientRect();
        const iconElement = card.querySelector('.material-symbols-outlined');
        const titleElement = card.querySelector('h3');
        const hintElement = card.querySelector('.expand-hint');
        
        const iconBounds = iconElement.getBoundingClientRect();
        const titleBounds = titleElement.getBoundingClientRect();
        const hintBounds = hintElement.getBoundingClientRect();

        // 2. LAST: Get "Always There" Content from the card itself
        const title = titleElement.innerText;
        const iconName = iconElement.innerText;
        const detailsContainer = card.querySelector('.card-details-content');
        
        if (!detailsContainer) {
            console.error('No details found for this card. Ensure .card-details-content exists in HTML.');
            return;
        }

        const expanded = document.createElement('div');
        expanded.className = 'service-card expanded';
        if (document.documentElement.classList.contains('dark')) expanded.classList.add('dark');
        
        expanded.innerHTML = `
            <button class="close-expanded"><span class="material-symbols-outlined">close</span></button>
            <div class="detail-header">
                <div class="detail-icon"><span class="material-symbols-outlined text-4xl">${iconName}</span></div>
                <h2 class="detail-title">${title}</h2>
            </div>
            <div class="expanded-content-body">
                ${detailsContainer.innerHTML}
            </div>
            <div class="expanded-cta-group">
                <div class="expanded-cta btn-team"><span class="material-symbols-outlined">group</span> <span class="hide-on-mobile">Meet Our&nbsp;</span>Team</div>
                <div class="expanded-cta btn-insights"><span class="hide-on-mobile">Explore&nbsp;</span>Insights <span class="material-symbols-outlined">arrow_forward</span></div>
            </div>
        `;

        expanded.style.visibility = 'hidden';
        document.body.appendChild(expanded);
        
        // Setup CTA functionality
        const btnInsights = expanded.querySelector('.btn-insights');
        btnInsights.onclick = (e) => {
            e.stopPropagation();
            window.location.href = '../blog/index.html';
        };

        const btnTeam = expanded.querySelector('.btn-team');
        btnTeam.onclick = (e) => {
            e.stopPropagation();
            window.location.href = '../team/index.html';
        };
        
        await new Promise(r => setTimeout(r, 20)); // Force layout
        
        const lastCardBounds = expanded.getBoundingClientRect();
        const lastIcon = expanded.querySelector('.detail-icon');
        const lastTitle = expanded.querySelector('.detail-title');
        
        const lastIconBounds = lastIcon.getBoundingClientRect();
        const lastTitleBounds = lastTitle.getBoundingClientRect();

        // 3. PLAY: Transition
        expanded.style.visibility = 'visible';
        overlay.classList.add('active');
        document.body.classList.add('modal-open');
        activeCard = expanded;
        activeCard.originatingCard = card;
        
        // NOTE: We no longer hide the originating card to prevent the "empty gap" flicker

        const spring = 'cubic-bezier(0.34, 1.15, 0.64, 1)'; // Subtle professional spring
        const duration = 650;

        // Container Morph (Raising effect)
        expanded.animate([
            {
                transform: `translate(${cardBounds.left - lastCardBounds.left}px, ${cardBounds.top - lastCardBounds.top}px) scale(${cardBounds.width/lastCardBounds.width}, ${cardBounds.height/lastCardBounds.height})`,
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                opacity: 0.8
            },
            {
                transform: 'translate(-50%, -50%) scale(1.02, 1.02)',
                offset: 0.8
            },
            {
                transform: 'translate(-50%, -50%) scale(1, 1)',
                borderRadius: '24px',
                boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.6)',
                opacity: 1
            }
        ], { duration, easing: spring, fill: 'both' });

        // Icon Morph
        lastIcon.animate([
            { transform: `translate(${iconBounds.left - lastIconBounds.left}px, ${iconBounds.top - lastIconBounds.top}px) scale(0.8)`, opacity: 0.8 },
            { transform: 'translate(0, 0) scale(1)', opacity: 1 }
        ], { duration, easing: spring, fill: 'both' });

        // Title Morph
        lastTitle.animate([
            { transform: `translate(${titleBounds.left - lastTitleBounds.left}px, ${titleBounds.top - lastTitleBounds.top}px) scale(0.4)`, transformOrigin: 'top left' },
            { transform: 'translate(0, 0) scale(1)', transformOrigin: 'top left' }
        ], { duration, easing: spring, fill: 'both' });

        // CTAs fade in via CSS when .ready is added

        expanded.onfinish = () => {
            expanded.classList.add('ready');
        };
        
        // Add a small delay for the "ready" class to ensure content animation triggers
        setTimeout(() => expanded.classList.add('ready'), 50);

        expanded.querySelector('.close-expanded').onclick = closeExpanded;
    }

    function closeExpanded() {
        if (!activeCard) return;

        const expanded = activeCard;
        const card = expanded.originatingCard;
        expanded.classList.remove('ready');

        const currentBounds = expanded.getBoundingClientRect();
        const targetBounds = card.getBoundingClientRect();
        
        overlay.classList.remove('active');
        document.body.classList.remove('modal-open');

        const duration = 500;
        const spring = 'cubic-bezier(0.34, 1.15, 0.64, 1)';

        const exit = expanded.animate([
            { transform: 'translate(-50%, -50%) scale(1, 1)', opacity: 1 },
            { transform: `translate(${targetBounds.left - currentBounds.left}px, ${targetBounds.top - currentBounds.top}px) scale(${targetBounds.width/currentBounds.width}, ${targetBounds.height/currentBounds.height})`, opacity: 0 }
        ], { duration, easing: spring, fill: 'both' });

        exit.onfinish = () => {
            if (activeCard && activeCard.parentNode) {
                activeCard.parentNode.removeChild(activeCard);
            }
            activeCard = null;
        };
    }

    overlay.addEventListener('click', closeExpanded);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeExpanded();
    });

    // Accordion Toggle Logic
    document.addEventListener('click', (e) => {
        const accordion = e.target.closest('.service-accordion');
        if (accordion) {
            const parentList = accordion.closest('.detail-list');
            if (parentList) {
                const siblings = parentList.querySelectorAll('.service-accordion.is-open');
                siblings.forEach(sib => {
                    if (sib !== accordion) sib.classList.remove('is-open');
                });
            }
            accordion.classList.toggle('is-open');
        }
    });
});
