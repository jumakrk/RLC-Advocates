document.addEventListener('DOMContentLoaded', () => {

    // --- Sticky Header on Scroll ---
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- Mobile Menu Toggle ---
    const hamburger = document.querySelector('.hamburger-menu');
    const nav = document.querySelector('.main-nav');

    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            nav.classList.toggle('active');
        });

        // Close when clicking a link
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                nav.classList.remove('active');
            });
        });
    }

    // --- Mobile Menu Toggle Removed ---

    // --- Smooth Scroll for Anchors ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            nav.classList.remove('active'); // Close menu on click

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

    AOS.init({
        duration: 800,
        offset: 100,
        easing: 'ease-out-cubic',
        once: false, /* Animate every time it comes into view */
        mirror: true /* Animate out while scrolling past */
    });

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
            color: 0xe36414,
            size: 0.7,
            transparent: true,
            opacity: 0.8
        });

        const particles = new THREE.Points(geometry, material);
        group.add(particles);

        // Lines Geometry (for connections)
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xe36414,
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
});
