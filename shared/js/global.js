document.addEventListener('DOMContentLoaded', () => {

    // --- Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, err => {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }

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
            toggle.addEventListener('click', () => {
                const isActive = mobileMenu.classList.toggle('active');
                document.body.classList.toggle('overflow-hidden');
                
                // Toggle Icon
                const icon = toggle.querySelector('.material-symbols-outlined');
                if (icon) {
                    icon.textContent = isActive ? 'close' : 'menu';
                }
            });
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

    // --- WhatsApp Floating Widget (Dynamic Injection) ---
    const waFloat = document.createElement('a');
    waFloat.href = "https://wa.me/254104800800?text=Hello%20RLC%20Advocates%2C%20I%20would%20like%20to%20inquire%20about%20your%20services.";
    waFloat.className = "whatsapp-float";
    waFloat.target = "_blank";
    waFloat.innerHTML = '<svg viewBox="0 0 448 512" width="30" height="30" fill="currentColor"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.7 17.8 69.4 27.2 106.2 27.2h.1c122.3 0 222-99.6 222-222 0-59.3-23-115.1-65.1-157.1zM223.9 445.9c-33.1 0-65.7-8.9-94.1-25.7l-6.7-4-69.9 18.3L71.5 366l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-82.7 184.6-184.5 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.4-8.6-44.6-27.6-16.5-14.7-27.6-32.8-30.8-38.4-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.6-9.2 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.5 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>';
    document.body.appendChild(waFloat);

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
            // Mouse Influence
            group.rotation.y += 0.001 + (mouseX * 0.05 - group.rotation.y) * 0.05;
            group.rotation.x += 0.001 + (mouseY * 0.05 - group.rotation.x) * 0.05;

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
