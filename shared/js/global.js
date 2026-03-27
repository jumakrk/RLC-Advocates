document.addEventListener('DOMContentLoaded', () => {
    const WHATSAPP_NUMBER = '254104800800';
    const TAWK_SRC = 'https://embed.tawk.to/698d94b5a6904d1c351635e1/1jkn3tkca';
    let tawkLoadPromise = null;
    let tawkBubbleGuardStarted = false;
    let supportFabElement = null;

    function setSupportFabVisible(isVisible) {
        if (!supportFabElement) return;
        supportFabElement.style.display = isVisible ? 'flex' : 'none';
    }

    function loadTawkTo() {
        if (window.Tawk_API && typeof window.Tawk_API.maximize === 'function') {
            return Promise.resolve(window.Tawk_API);
        }

        if (tawkLoadPromise) return tawkLoadPromise;

        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();

        tawkLoadPromise = new Promise((resolve, reject) => {
            const existingScript = document.querySelector(`script[src="${TAWK_SRC}"]`);
            if (existingScript) {
                // Already being/was loaded; resolve with best-effort API object.
                resolve(window.Tawk_API);
                return;
            }

            window.Tawk_API.onLoad = function onTawkLoad() {
                resolve(window.Tawk_API);
            };

            const s1 = document.createElement('script');
            const s0 = document.getElementsByTagName('script')[0];
            s1.async = true;
            s1.src = TAWK_SRC;
            s1.charset = 'UTF-8';
            s1.setAttribute('crossorigin', '*');
            s1.onerror = reject;
            s0.parentNode.insertBefore(s1, s0);
        });

        return tawkLoadPromise;
    }

    function setupTawk(api) {
        if (!api) return;

        const hideNativeBubble = () => {
            try {
                if (typeof api.hideWidget === 'function') {
                    api.hideWidget();
                }
            } catch (e) {
                // Ignore - Tawk API may not be fully ready in some states.
            }
        };

        const hideNativeBubbleWithRetry = () => {
            hideNativeBubble();
            setTimeout(hideNativeBubble, 180);
            setTimeout(hideNativeBubble, 650);
        };

        // On initial load: hide Tawk native bubble; we control visibility via our launcher.
        hideNativeBubbleWithRetry();
        setSupportFabVisible(true);

        // When Tawk is opened/maximized: hide our launcher.
        api.onChatMaximized = () => setSupportFabVisible(false);
        api.onChatStarted = () => setSupportFabVisible(false);

        // When Tawk is closed/minimized: hide native bubble again + show our launcher.
        api.onChatMinimized = () => {
            hideNativeBubbleWithRetry();
            setSupportFabVisible(true);
        };
        api.onWidgetMinimized = () => {
            hideNativeBubbleWithRetry();
            setSupportFabVisible(true);
        };
        api.onChatHidden = () => {
            hideNativeBubbleWithRetry();
            setSupportFabVisible(true);
        };
        api.onChatEnded = () => {
            hideNativeBubbleWithRetry();
            setSupportFabVisible(true);
        };

        // Fallback guard: if Tawk reports minimized state, force-hide bubble.
        if (!tawkBubbleGuardStarted) {
            tawkBubbleGuardStarted = true;
            window.setInterval(() => {
                try {
                    if (
                        api &&
                        typeof api.isChatMinimized === 'function' &&
                        api.isChatMinimized()
                    ) {
                        hideNativeBubble();
                        setSupportFabVisible(true);
                    }
                } catch (e) {
                    // Ignore.
                }
            }, 800);
        }
    }

    function createSupportFab() {
        if (document.getElementById('support-fab')) return;

        const wrapper = document.createElement('div');
        wrapper.id = 'support-fab';
        wrapper.className = 'support-fab';
        wrapper.innerHTML = `
            <div class="support-fab-actions" aria-hidden="true">
                <button type="button" class="support-fab-action support-fab-chat" aria-label="Open live chat">
                    <span class="material-symbols-outlined">smart_toy</span>
                </button>
                <a
                    class="support-fab-action support-fab-whatsapp"
                    href="https://wa.me/${WHATSAPP_NUMBER}"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open WhatsApp"
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884Z" />
                    </svg>
                </a>
            </div>
            <button type="button" class="support-fab-toggle" aria-label="Open support options" aria-expanded="false">
                <span class="material-symbols-outlined support-fab-toggle-icon support-fab-open-icon">message</span>
                <span class="material-symbols-outlined support-fab-toggle-icon support-fab-close-icon">close</span>
            </button>
        `;

        document.body.appendChild(wrapper);
        supportFabElement = wrapper;

        const toggleBtn = wrapper.querySelector('.support-fab-toggle');
        const chatBtn = wrapper.querySelector('.support-fab-chat');

        const closeFab = () => {
            wrapper.classList.remove('open');
            toggleBtn.setAttribute('aria-expanded', 'false');
        };

        toggleBtn.addEventListener('click', () => {
            const isOpen = wrapper.classList.toggle('open');
            toggleBtn.setAttribute('aria-expanded', String(isOpen));
        });

        chatBtn.addEventListener('click', async () => {
            closeFab();
            try {
                const api = await loadTawkTo();
                setupTawk(api);
                if (typeof api.showWidget === 'function') {
                    api.showWidget();
                }
                if (typeof api.maximize === 'function') {
                    api.maximize();
                }
                setSupportFabVisible(false);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Failed to load Tawk widget.', error);
            }
        });

        document.addEventListener('click', (event) => {
            if (!wrapper.contains(event.target)) {
                closeFab();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeFab();
        });
    }

    createSupportFab();
    loadTawkTo()
        .then((api) => setupTawk(api))
        .catch(() => {});

    // --- Unregister Service Workers & Clear Caches ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => registration.unregister());
        });
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            });
        }
    }

    // --- Back to Top Button ---
    const backToTop = document.createElement('button');
    backToTop.id = 'back-to-top';
    backToTop.setAttribute('aria-label', 'Back to top');
    backToTop.innerHTML = '<span class="material-symbols-outlined">arrow_upward</span>';
    document.body.appendChild(backToTop);

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    // --- Sticky Header on Scroll ---
    // --- Sticky Header on Scroll ---
    // --- Sticky Header on Scroll ---
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            header?.classList.add('backdrop-blur-xl', 'shadow-md');
        } else {
            header?.classList.remove('backdrop-blur-xl', 'shadow-md');
        }
    });

    // --- Mobile Menu Toggle ---
    const mobileToggles = document.querySelectorAll('.mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileToggles.length > 0 && mobileMenu) {
        mobileToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const isActive = mobileMenu.classList.toggle('active');
                
                // Toggle Icon
                const icon = toggle.querySelector('.material-symbols-outlined');
                if (icon) {
                    icon.style.transform = 'scale(0)';
                    setTimeout(() => {
                        icon.textContent = isActive ? 'close' : 'menu';
                        icon.style.transform = 'scale(1)';
                    }, 150);
                }
            });
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileMenu.classList.contains('active') && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.remove('active');
                mobileToggles.forEach(toggle => {
                    const icon = toggle.querySelector('.material-symbols-outlined');
                    if (icon) icon.textContent = 'menu';
                });
            }
        });

        // Close when clicking a link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                document.body.classList.remove('overflow-hidden');
                
                // Reset Icon
                mobileToggles.forEach(toggle => {
                    const icon = toggle.querySelector('.material-symbols-outlined');
                    if (icon) icon.textContent = 'menu';
                });
            });
        });
    }

    // --- Mobile Menu Toggle Removed ---

    // --- Smooth Scroll for Anchors ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            mobileMenu?.classList.remove('active'); // Close menu on click

            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                // Offset for header height
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // --- Form Submission (Simulation) ---
    const appointmentForm = document.getElementById('appointment-form');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Consultation request received! We will contact you shortly.');
            appointmentForm.reset();
        });
    }

    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for subscribing to our newsletter!');
            newsletterForm.reset();
        });
    }

    // --- Animation on Scroll (Observer) ---
    const observerOptions = {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once visible if we only want it to run once
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Elements to animate (Legacy Custom Observer - Keeping for specific classes if needed, or remove)
    // For now, we rely on AOS

    // Dynamic AOS Adjustment for Mobile
    if (window.innerWidth <= 900) {
        const aboutContent = document.querySelector('.about-content');
        if (aboutContent) {
            aboutContent.setAttribute('data-aos', 'fade-up');
        }
    }

    // --- AOS Animation Logic ---
    // Initialize AOS - animations repeat on every scroll
    window.__aosConfig = {
        duration: 800,
        offset: 100,
        easing: 'ease-out-cubic',
        once: false, 
        mirror: true
    };
    AOS.init(window.__aosConfig);

    // --- Auto Update Year ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }



    // --- Advanced Three.js: Connected Constellation (Modern/Fancy) ---
    const canvasContainer = document.getElementById('webgl-container');
    if (canvasContainer) {
        const scene = new THREE.Scene();

        // Camera setup
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 100;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // optimize performance
        canvasContainer.appendChild(renderer.domElement);

        // Particles
        const particleCount = 200;
        const group = new THREE.Group();
        scene.add(group);

        // Geometries
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 150;     // x
            positions[i * 3 + 1] = (Math.random() - 0.5) * 150; // y
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100; // z

            velocities.push({
                x: (Math.random() - 0.5) * 0.05,
                y: (Math.random() - 0.5) * 0.05,
                z: (Math.random() - 0.5) * 0.05
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Material: Glowing Orange Points
        const material = new THREE.PointsMaterial({
            color: 0xFD641F,
            size: 0.7,
            transparent: true,
            opacity: 0.8
        });

        const particles = new THREE.Points(geometry, material);
        group.add(particles);

        // Lines Geometry (for connections)
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xFD641F,
            transparent: true,
            opacity: 0.15
        });

        const linesGeometry = new THREE.BufferGeometry();
        const linesMesh = new THREE.LineSegments(linesGeometry, lineMaterial);
        group.add(linesMesh);

        // Interaction State
        let mouseX = 0;
        let mouseY = 0;
        let scrollY = 0;

        // Listeners
        window.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        window.addEventListener('scroll', () => {
            scrollY = window.scrollY;
        });

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Loop
        function animate() {
            requestAnimationFrame(animate);

            // 1. Update Particles Position
            const positions = particles.geometry.attributes.position.array;
            let linePositions = [];

            for (let i = 0; i < particleCount; i++) {
                // Movement
                positions[i * 3] += velocities[i].x;
                positions[i * 3 + 1] += velocities[i].y;
                positions[i * 3 + 2] += velocities[i].z;

                // Boundary Check (Loop around)
                if (Math.abs(positions[i * 3]) > 100) positions[i * 3] *= -1;
                if (Math.abs(positions[i * 3 + 1]) > 100) positions[i * 3 + 1] *= -1;
                if (Math.abs(positions[i * 3 + 2]) > 100) positions[i * 3 + 2] *= -1;

                // Check connections (The heavy part)
                // Only connect to nearby points to create "Web"
                // Simplified: connect if index is close for performance or double loop
                // We'll do a simple limited loop for performance
                for (let j = i + 1; j < particleCount; j++) {
                    const dx = positions[i * 3] - positions[j * 3];
                    const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                    const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (dist < 20) {
                        linePositions.push(
                            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
                            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
                        );
                    }
                }
            }

            particles.geometry.attributes.position.needsUpdate = true;

            // Update Lines
            linesMesh.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

            // 2. Global Rotation & Interaction
            // Mouse Influence (Inverted & Faster Tracking)
            const targetRotY = -mouseX * 0.2; // Inverted X
            const targetRotX = mouseY * 0.2;  // Inverted Y (Positive factor for opposite movement)

            group.rotation.y += 0.0005 + (targetRotY - group.rotation.y) * 0.06;
            group.rotation.x += 0.0005 + (targetRotX - group.rotation.x) * 0.06;

            // Scroll Zoom / Fly-through
            camera.position.z = 100 - (scrollY * 0.02); // Move camera forward on scroll

            renderer.render(scene, camera);
        }

        animate();
    }
    // --- FAQ Toggle Logic ---
    window.toggleFaq = function(button) {
        const item = button.closest('.faq-item');
        item.classList.toggle('active');
    };
});

// Ensure toggleFaq is globally available if script loads after DOM
window.toggleFaq = window.toggleFaq || function(button) {
    const item = button.closest('.faq-item');
    item.classList.toggle('active');
};

// --- BFCache Fix: Re-initialize AOS when navigating back ---
// This MUST be outside DOMContentLoaded since bfcache doesn't re-fire it
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        // Strip all AOS state from elements so they can be re-animated
        document.querySelectorAll('[data-aos]').forEach(function(el) {
            el.classList.remove('aos-init', 'aos-animate');
            // Only remove AOS-specific inline styles, not other styles
            el.style.removeProperty('transition-delay');
            el.style.removeProperty('transition-duration');
            el.style.removeProperty('transition-timing-function');
            el.style.removeProperty('transform');
            el.style.removeProperty('opacity');
        });
        // Re-initialize AOS completely
        if (window.__aosConfig) {
            AOS.init(window.__aosConfig);
        }
    }
});
