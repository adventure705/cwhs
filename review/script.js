document.addEventListener('DOMContentLoaded', () => {
    const reviewsGrid = document.getElementById('reviews-grid');
    const totalReviewsEl = document.getElementById('total-reviews');
    const averageRatingEl = document.getElementById('average-rating');
    const headerStarsEl = document.getElementById('header-stars');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const loader = document.getElementById('loader');

    let allReviews = [];

    // Initialize
    fetchReviews();

    async function fetchReviews() {
        try {
            loader.classList.add('active');
            
            // In a local environment, fetching a local JSON file directly might cause CORS issues
            // running it over a local server like `python -m http.server` resolves this.
            const response = await fetch('reviews.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const rawReviews = await response.json();
            
            // Filter out 3 stars and below
            allReviews = rawReviews.filter(r => r.star_rating > 3);
            
            // Default sort: Newest first
            allReviews.sort((a, b) => new Date(b.date_reviewed) - new Date(a.date_reviewed));
            
            calculateStats(allReviews);
            
            // Trigger default sort click to apply random Moon praise logic
            const defaultBtn = document.querySelector('.filter-btn[data-sort="newest"]');
            if (defaultBtn) defaultBtn.click();
            else renderReviews(allReviews);
            
            loader.classList.remove('active');
        } catch (error) {
            console.error("Error fetching reviews:", error);
            loader.classList.remove('active');
            reviewsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: rgba(255,0,0,0.1); border-radius: 12px;">
                    <h3>Oops! Could not load reviews.</h3>
                    <p>Make sure you are running this via a local web server (e.g., Python HTTP server) due to CORS restrictions with local files.</p>
                </div>
            `;
        }
    }

    function calculateStats(reviews) {
        if (reviews.length === 0) return;
        
        const total = reviews.length;
        const sumRatings = reviews.reduce((acc, review) => acc + review.star_rating, 0);
        const average = (sumRatings / total).toFixed(1);
        
        totalReviewsEl.textContent = total;
        averageRatingEl.textContent = average;
        
        headerStarsEl.innerHTML = generateStarsHTML(Math.round(average));
    }

    function highlightPraise(text) {
        if (!text) return text;
        // Highlight sentences containing 'Moon' or general praise context
        const regex = /([^.!?\n]*(?:Moon|seller)[^.!?\n]*[.!?]?)/gi;
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    // Generate a consistent color based on a string (e.g. reviewer name)
    function getAvatarColor(name) {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = hash % 360;
        return `hsl(${h}, 70%, 60%)`;
    }

    function createSparkles() {
        const header = document.querySelector('.header');
        header.style.position = 'relative';
        header.style.overflow = 'hidden';
        
        const sparklesContainer = document.createElement('div');
        sparklesContainer.className = 'sparkles-container';
        header.insertBefore(sparklesContainer, header.firstChild);
        
        // Create 45 magical particles
        for (let i = 0; i < 45; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle-particle';
            
            const size = Math.random() * 4 + 2; // 2px to 6px
            const left = Math.random() * 100; // 0% to 100%
            const delay = Math.random() * 5; // 0s to 5s
            const duration = Math.random() * 4 + 3; // 3s to 7s
            
            sparkle.style.width = `${size}px`;
            sparkle.style.height = `${size}px`;
            sparkle.style.left = `${left}%`;
            sparkle.style.animationDelay = `${delay}s`;
            sparkle.style.animationDuration = `${duration}s`;
            
            // Randomize color: 60% gold, 40% white/silver
            if (Math.random() > 0.6) {
                sparkle.style.background = 'radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 70%)';
                sparkle.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.8)';
            }
            
            sparklesContainer.appendChild(sparkle);
        }
    }

    const sellerResponses = [
        "Thank you so much for your sweet words! I'm so glad your kids loved the surprise. 🥰",
        "It was an absolute pleasure making this for you! Hope you have a magical trip! ✨",
        "Your review truly made my day. Thank you for letting me be a part of such a special moment! 💖",
        "I'm so thrilled to hear this! Creating these magical reveals is what I love most. Thank you! 🌟",
        "Thank you! Hearing how much joy this brought to your family means the world to me. 🥹"
    ];

    function renderReviews(reviews) {
        reviewsGrid.innerHTML = '';
        
        if (reviews.length === 0) {
            reviewsGrid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">No reviews found matching the criteria.</div>';
            return;
        }

        const fragment = document.createDocumentFragment();

        reviews.forEach((review, index) => {
            const delay = (index % 10) * 0.05; // Stagger animation for batches
            
            const card = document.createElement('div');
            card.className = 'review-card';
            card.style.animationDelay = `${delay}s`;
            
            const reviewerName = review.reviewer || 'Anonymous';
            const initial = reviewerName.charAt(0).toUpperCase();
            const avatarColor = getAvatarColor(reviewerName);
            
            const hasComment = review.message && review.message.trim().length > 0;
            let message = hasComment ? review.message : "No written comment provided.";
            
            if (hasComment) {
                message = highlightPraise(message);
            }

            const textClass = hasComment ? "review-text" : "review-text no-comment";
            
            let sellerResponseHTML = '';
            // Show response on roughly 15% of 5-star reviews with comments
            if (hasComment && review.star_rating === 5 && Math.random() < 0.15) {
                const randomMsg = sellerResponses[Math.floor(Math.random() * sellerResponses.length)];
                sellerResponseHTML = `
                    <div class="seller-response">
                        <div class="seller-header">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            <strong>Response from Moon</strong>
                        </div>
                        <p>${randomMsg}</p>
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="card-header">
                    <div class="reviewer-info">
                        <div class="avatar" style="background: ${avatarColor}; box-shadow: 0 4px 10px ${avatarColor}40;">${initial}</div>
                        <div class="reviewer-details">
                            <h3 title="${reviewerName}">
                                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;">${reviewerName}</span>
                                <svg class="verified-icon" width="14" height="14" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" title="Verified Customer">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                    <polyline points="9 12 11 14 15 10" stroke="white" stroke-width="3"></polyline>
                                </svg>
                            </h3>
                            <div class="date">${review.date_reviewed}</div>
                        </div>
                    </div>
                    <div class="stars">
                        ${generateStarsHTML(review.star_rating)}
                    </div>
                </div>
                <div class="review-body">
                    <p class="${textClass}">${message}</p>
                    ${sellerResponseHTML}
                </div>
                <div class="card-footer">
                    <span class="verified-purchase">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Verified Purchase
                    </span>
                    <span class="order-id">Order #${review.order_id}</span>
                </div>
            `;
            
            fragment.appendChild(card);
        });

        reviewsGrid.appendChild(fragment);
    }

    function generateStarsHTML(rating) {
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                starsHTML += '<span class="star filled">★</span>';
            } else {
                starsHTML += '<span class="star">★</span>';
            }
        }
        return starsHTML;
    }

    // Sort Logic
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const sortValue = e.target.getAttribute('data-sort');
            let sortedReviews = [...allReviews];
            
            if (sortValue === 'newest') {
                sortedReviews.sort((a, b) => new Date(b.date_reviewed) - new Date(a.date_reviewed));
                
                // Randomly feature 1-2 Moon reviews at the top to avoid clustering
                const moonReviews = sortedReviews.filter(r => (r.message || '').toLowerCase().includes('moon'));
                if (moonReviews.length > 0) {
                    // Pick 2 random unique Moon reviews
                    const shuffledMoon = moonReviews.sort(() => 0.5 - Math.random()).slice(0, 2);
                    
                    // Remove them from current positions
                    sortedReviews = sortedReviews.filter(r => !shuffledMoon.includes(r));
                    
                    // Insert them at random positions within the top 4
                    shuffledMoon.forEach(moonReview => {
                        const insertPos = Math.floor(Math.random() * 4);
                        sortedReviews.splice(insertPos, 0, moonReview);
                    });
                }
            } else if (sortValue === 'rating') {
                // Sort by rating descending, then newest first
                sortedReviews.sort((a, b) => {
                    if (b.star_rating !== a.star_rating) {
                        return b.star_rating - a.star_rating;
                    }
                    return new Date(b.date_reviewed) - new Date(a.date_reviewed);
                });
            }
            
            renderReviews(sortedReviews);
        });
    });

    // Image Slider Auto-Scroll and Modal Logic
    const sliderTrack = document.querySelector('.slider-track');
    const slides = document.querySelectorAll('.slide');
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');
    const modalClose = document.querySelector('.modal-close');

    let isHovering = false;
    let autoScrollInterval;

    // Start auto-scroll
    function startAutoScroll() {
        autoScrollInterval = setInterval(() => {
            if (!isHovering && sliderTrack) {
                sliderTrack.scrollLeft += 1;
                // Infinite scroll loop reset
                if (sliderTrack.scrollLeft >= (sliderTrack.scrollWidth - sliderTrack.clientWidth) - 1) {
                    sliderTrack.scrollLeft = 0;
                }
            }
        }, 30); // Speed of auto-scroll
    }

    if (sliderTrack) {
        startAutoScroll();
        
        // Pause on interaction
        sliderTrack.addEventListener('mouseenter', () => isHovering = true);
        sliderTrack.addEventListener('mouseleave', () => isHovering = false);
        sliderTrack.addEventListener('touchstart', () => isHovering = true, {passive: true});
        sliderTrack.addEventListener('touchend', () => {
            setTimeout(() => { isHovering = false; }, 1000);
        });
    }

    // Modal click events
    slides.forEach(slide => {
        slide.addEventListener('click', () => {
            const img = slide.querySelector('img');
            const name = slide.querySelector('.slide-name').textContent;
            
            modalImg.src = img.src;
            modalCaption.textContent = name;
            modal.classList.add('show');
            isHovering = true; // Pause slider when modal is open
        });
    });

    // Close modal
    function closeModal() {
        modal.classList.remove('show');
        isHovering = false;
        setTimeout(() => {
            modalImg.src = '';
        }, 300); // Clear after fade out
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // Close on click outside image
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
});
