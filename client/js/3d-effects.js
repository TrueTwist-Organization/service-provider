// ═══════════════════════════════════════════════════════════════════════════════
//  FIXKAR ULTIMATE 3D ENGINE
//  Immersive Three.js Environment & Advanced Motion Mechanics
// ═══════════════════════════════════════════════════════════════════════════════

function initThreeBG() {
    console.log("FixKar Cinematic Wide-Ecosystem Initializing...");
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "0";
    canvas.style.opacity = "1";

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 15; 

    scene.fog = new THREE.FogExp2(0x020617, 0.012);

    // Dynamic Dust
    const count = 5000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 80;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    const partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(partGeo, new THREE.PointsMaterial({ size: 0.015, color: 0xfacc15, transparent: true, opacity: 0.2 })));

    // PREMIUM TECH ATMOSPHERE - 3D GRID
    const gridCount = 20;
    const gridGroup = new THREE.Group();
    const lineMat = new THREE.LineBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.1 });
    
    for (let i = -gridCount; i <= gridCount; i++) {
        // Horizontal Lines
        const hPoints = [new THREE.Vector3(-30, i * 2, -10), new THREE.Vector3(30, i * 2, -10)];
        const hGeo = new THREE.BufferGeometry().setFromPoints(hPoints);
        gridGroup.add(new THREE.Line(hGeo, lineMat));

        // Vertical Lines
        const vPoints = [new THREE.Vector3(i * 2, -30, -10), new THREE.Vector3(i * 2, 30, -10)];
        const vGeo = new THREE.BufferGeometry().setFromPoints(vPoints);
        gridGroup.add(new THREE.Line(vGeo, lineMat));
    }
    scene.add(gridGroup);

    // FLOATING TECH CRYSTALS
    const crystalGroup = new THREE.Group();
    const crystalGeo = new THREE.OctahedronGeometry(1.5, 0);
    const crystalMat = new THREE.MeshPhongMaterial({ 
        color: 0xfacc15, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.2,
        emissive: 0xfacc15,
        emissiveIntensity: 0.5
    });

    const crystals = [];
    for(let i=0; i<6; i++) {
        const mesh = new THREE.Mesh(crystalGeo, crystalMat);
        mesh.position.set(
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 10 - 5
        );
        mesh.rotation.set(Math.random(), Math.random(), Math.random());
        crystalGroup.add(mesh);
        crystals.push({ mesh, speed: 0.01 + Math.random() * 0.02 });
    }
    scene.add(crystalGroup);
    
    // Track references for animation
    const serviceItems = crystals; 
    const cloudGroup = crystalGroup;

    const pointLight = new THREE.PointLight(0xfacc15, 5, 40);
    scene.add(pointLight);
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5);
        mouseY = (e.clientY / window.innerHeight - 0.5);
        pointLight.position.set(mouseX * 30, -mouseY * 30, 15);
    });

    function animate() {
        requestAnimationFrame(animate);
        
        crystals.forEach((item, i) => {
            item.mesh.rotation.x += item.speed * 0.5;
            item.mesh.rotation.y += item.speed;
            item.mesh.position.y += Math.sin(Date.now() * 0.001 + i) * 0.01;
        });

        if(gridGroup) {
            gridGroup.rotation.y = mouseX * 0.2;
            gridGroup.rotation.x = -mouseY * 0.2;
        }

        camera.position.x += (mouseX * 8 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 8 - camera.position.y) * 0.05;
        camera.lookAt(0, 0, -5);
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        const w = canvas.clientWidth; const h = canvas.clientHeight;
        camera.aspect = w / h; camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });
}






function initGSAPAnimations() {
    if (typeof gsap === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // Luxury Header Reveal
    gsap.from('#navbar', {
        y: -100, opacity: 0, duration: 1.2, ease: "expo.out"
    });

    // 3D Staggered Hero Entrances
    const heroTl = gsap.timeline();
    heroTl.from('.hero-h1', { y: 100, opacity: 0, rotateX: -30, duration: 1.2, ease: "power4.out" })
        .from('.hero-visuals-premium', { x: 100, opacity: 0, duration: 1.5, ease: "expo.out" }, "-=1");

    // Luxury Card 3D Entrance (Flip Effect)
    gsap.utils.toArray('.premium-card, .trust-card, .how-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 90%",
            },
            opacity: 0,
            y: 100,
            rotateX: 45,
            scale: 0.9,
            duration: 1.2,
            ease: "power4.out",
            delay: (i % 3) * 0.15
        });
    });

    // Parallax Sections
    gsap.utils.toArray('.parallax-slow').forEach(el => {
        gsap.to(el, {
            scrollTrigger: {
                trigger: el,
                scrub: true,
                start: "top bottom",
                end: "bottom top"
            },
            y: -60,
            ease: "none"
        });
    });
}

function initTiltEffects() {
    if (typeof VanillaTilt === 'undefined') return;

    const targets = document.querySelectorAll('.glass-card, .tt-card, .luxury-badge');
    VanillaTilt.init(Array.from(targets), {
        max: 12,
        speed: 800,
        glare: true,
        "max-glare": 0.4,
        scale: 1.05,
        perspective: 1500,
        gyroscope: true
    });
}

function initMagneticElements() {
    const magneticBtns = document.querySelectorAll('.nav-cta, .search-btn, .submit-btn, .logo-icon');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(btn, {
                x: x * 0.4,
                y: y * 0.4,
                duration: 0.4,
                ease: "power2.out"
            });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)"
            });
        });
    });
}

// Global Initialization
document.addEventListener('DOMContentLoaded', () => {
    initThreeBG();
    initGSAPAnimations();
    initTiltEffects();
    initMagneticElements();
});
