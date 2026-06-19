document.addEventListener('DOMContentLoaded', () => {
    // --- Advanced Three.js: Connected Constellation (Modern/Fancy) ---
    const canvasContainer = document.getElementById('webgl-container');
    if (canvasContainer && typeof THREE !== 'undefined') {
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
});
