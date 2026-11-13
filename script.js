
import * as THREE from 'three';

// ==========================================
// 1. INITIALIZE THREE.JS
// ==========================================

const container = document.getElementById("scene-container");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
});

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.toneMapping = THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1.2;

container.appendChild(renderer.domElement);


// ==========================================
// 2. LIGHTING
// ==========================================

scene.add(
    new THREE.AmbientLight(0xffffff, 2)
);

const mainLight = new THREE.DirectionalLight(
    0xffffff,
    3
);

mainLight.position.set(5, 5, 8);

scene.add(mainLight);

const blueLight = new THREE.PointLight(
    0x2563a6,
    30,
    20
);

blueLight.position.set(3, 2, 4);

scene.add(blueLight);

const tealLight = new THREE.PointLight(
    0x159b9a,
    20,
    20
);

tealLight.position.set(-3, -2, 4);

scene.add(tealLight);


// ==========================================
// 3. MATERIALS
// ==========================================

const blueMaterial = new THREE.MeshStandardMaterial({
    color: 0x2563a6,
    roughness: 0.35,
    metalness: 0.25
});

const tealMaterial = new THREE.MeshStandardMaterial({
    color: 0x159b9a,
    roughness: 0.35,
    metalness: 0.2
});

const whiteMaterial = new THREE.MeshStandardMaterial({
    color: 0xe7eef5,
    roughness: 0.3,
    metalness: 0.15
});

const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x10243a,
    roughness: 0.4,
    metalness: 0.2
});


// ==========================================
// 4. HELPER FUNCTIONS
// ==========================================

function createGroup(name, x = 2.3, y = 0) {

    const group = new THREE.Group();

    group.name = name;

    group.position.set(x, y, 0);

    group.userData.targetOpacity = 0;

    group.userData.targetScale = 0.7;

    group.userData.targetRotation = 0;

    scene.add(group);

    return group;

}


function createNode(group, position, radius, material) {

    const geometry = new THREE.SphereGeometry(
        radius,
        24,
        24
    );

    const mesh = new THREE.Mesh(
        geometry,
        material.clone()
    );

    mesh.position.copy(position);

    group.add(mesh);

    return mesh;

}


function createConnection(group, start, end, color = 0x159b9a) {

    const geometry = new THREE.BufferGeometry().setFromPoints([
        start,
        end
    ]);

    const material = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.65
    });

    const line = new THREE.Line(
        geometry,
        material
    );

    group.add(line);

    return line;

}


function setGroupOpacity(group, opacity) {

    group.traverse(object => {

        if (object.material) {

            const materials = Array.isArray(object.material)
                ? object.material
                : [object.material];

            materials.forEach(material => {

                if (material.userData.baseOpacity === undefined) {
                    material.userData.baseOpacity =
                        material.opacity;
                }

                material.transparent = true;

                material.opacity =
                    material.userData.baseOpacity * opacity;

            });

        }

    });

}


// ==========================================
// 5. HERO: NETWORK GLOBE
// ==========================================

const heroGroup = createGroup("hero", 2.5, 0.1);


// Main globe

const globeGeometry = new THREE.IcosahedronGeometry(
    1.65,
    3
);

const globeMaterial = new THREE.MeshStandardMaterial({

    color: 0x8ab9cf,

    wireframe: true,

    transparent: true,

    opacity: 0.5,

    roughness: 0.4

});

const globe = new THREE.Mesh(
    globeGeometry,
    globeMaterial
);

heroGroup.add(globe);


// Inner sphere

const innerGeometry = new THREE.SphereGeometry(
    1.35,
    32,
    32
);

const innerMaterial = new THREE.MeshStandardMaterial({

    color: 0x2563a6,

    transparent: true,

    opacity: 0.12,

    roughness: 0.3,

    metalness: 0.3

});

const innerSphere = new THREE.Mesh(
    innerGeometry,
    innerMaterial
);

heroGroup.add(innerSphere);


// Globe nodes

const globeNodes = [];

for (let i = 0; i < 14; i++) {

    const phi = Math.acos(1 - 2 * (i + 0.5) / 14);

    const theta = Math.PI * (1 + Math.sqrt(5)) * i;

    const position = new THREE.Vector3(

        Math.cos(theta) * Math.sin(phi) * 1.7,

        Math.sin(theta) * Math.sin(phi) * 1.7,

        Math.cos(phi) * 1.7

    );

    const node = createNode(
        heroGroup,
        position,
        0.065,
        i % 2 === 0 ? tealMaterial : blueMaterial
    );

    globeNodes.push(node);

}


// Globe connecting lines

for (let i = 0; i < globeNodes.length; i++) {

    for (let j = i + 1; j < globeNodes.length; j++) {

        const distance = globeNodes[i].position.distanceTo(
            globeNodes[j].position
        );

        if (distance < 1.35) {

            createConnection(
                heroGroup,
                globeNodes[i].position,
                globeNodes[j].position
            );

        }

    }

}


// Outer orbit

const orbitGeometry = new THREE.TorusGeometry(
    2.15,
    0.012,
    12,
    100
);

const orbitMaterial = new THREE.MeshBasicMaterial({
    color: 0x159b9a,
    transparent: true,
    opacity: 0.6
});

const heroOrbit = new THREE.Mesh(
    orbitGeometry,
    orbitMaterial
);

heroOrbit.rotation.x = 1.2;

heroOrbit.rotation.y = 0.4;

heroGroup.add(heroOrbit);


// ==========================================
// 6. SERVICES: CONNECTED OBJECTS
// ==========================================

const servicesGroup = createGroup(
    "services",
    2.5,
    0
);


const servicePositions = [

    new THREE.Vector3(-1.1, 0.8, 0),

    new THREE.Vector3(1.1, 0.8, 0),

    new THREE.Vector3(0, -0.8, 0)

];

const serviceObjects = [];

servicePositions.forEach((position, index) => {

    const geometry = new THREE.BoxGeometry(
        0.8,
        0.8,
        0.8
    );

    const mesh = new THREE.Mesh(
        geometry,
        (index === 1 ? tealMaterial : blueMaterial).clone()
    );

    mesh.position.copy(position);

    mesh.rotation.set(0.3, 0.4, 0.2);

    servicesGroup.add(mesh);

    serviceObjects.push(mesh);

});


// Connect service objects

createConnection(
    servicesGroup,
    servicePositions[0],
    servicePositions[1],
    0x2563a6
);

createConnection(
    servicesGroup,
    servicePositions[1],
    servicePositions[2],
    0x159b9a
);

createConnection(
    servicesGroup,
    servicePositions[2],
    servicePositions[0],
    0x2563a6
);


// Central node

const serviceCore = createNode(
    servicesGroup,
    new THREE.Vector3(0, 0, 0),
    0.3,
    whiteMaterial
);


// ==========================================
// 7. EXPERTISE: NETWORK ARCHITECTURE
// ==========================================

const expertiseGroup = createGroup(
    "expertise",
    2.5,
    0
);


const architectureNodes = [

    new THREE.Vector3(0, 1.4, 0),

    new THREE.Vector3(-1.5, 0.4, 0),

    new THREE.Vector3(1.5, 0.4, 0),

    new THREE.Vector3(-1, -1.1, 0),

    new THREE.Vector3(1, -1.1, 0),

    new THREE.Vector3(0, 0, 0.5)

];


architectureNodes.forEach((position, index) => {

    createNode(
        expertiseGroup,
        position,
        index === 5 ? 0.22 : 0.15,
        index % 2 === 0 ? blueMaterial : tealMaterial
    );

});


// Create architecture connections

const architectureConnections = [

    [0, 1],
    [0, 2],
    [1, 2],
    [1, 3],
    [2, 4],
    [3, 4],
    [5, 0],
    [5, 1],
    [5, 2],
    [5, 3],
    [5, 4]

];


architectureConnections.forEach(([a, b]) => {

    createConnection(
        expertiseGroup,
        architectureNodes[a],
        architectureNodes[b]
    );

});


// Outer architecture ring

const architectureRing = new THREE.Mesh(

    new THREE.TorusGeometry(
        1.9,
        0.012,
        12,
        100
    ),

    new THREE.MeshBasicMaterial({
        color: 0x2563a6,
        transparent: true,
        opacity: 0.35
    })

);

architectureRing.rotation.x = 1;

expertiseGroup.add(architectureRing);


// ==========================================
// 8. PROCESS: CONNECTED WORKFLOW
// ==========================================

const processGroup = createGroup(
    "process",
    2.5,
    0
);


const processPositions = [

    new THREE.Vector3(-1.8, 0, 0),

    new THREE.Vector3(-0.6, 0, 0),

    new THREE.Vector3(0.6, 0, 0),

    new THREE.Vector3(1.8, 0, 0)

];


for (let i = 0; i < processPositions.length - 1; i++) {

    createConnection(
        processGroup,
        processPositions[i],
        processPositions[i + 1],
        0x159b9a
    );

}


const processNodes = [];


processPositions.forEach((position, index) => {

    const node = createNode(
        processGroup,
        position,
        0.23,
        index % 2 === 0 ? blueMaterial : tealMaterial
    );

    processNodes.push(node);

});


// Additional orbit

const processOrbit = new THREE.Mesh(

    new THREE.TorusGeometry(
        2.3,
        0.012,
        12,
        100
    ),

    new THREE.MeshBasicMaterial({
        color: 0x2563a6,
        transparent: true,
        opacity: 0.4
    })

);

processOrbit.rotation.x = Math.PI / 2;

processGroup.add(processOrbit);


// ==========================================
// 9. CONTACT: ORBITAL STRUCTURE
// ==========================================

const contactGroup = createGroup(
    "contact",
    2.5,
    0
);


const contactCore = createNode(
    contactGroup,
    new THREE.Vector3(0, 0, 0),
    0.5,
    blueMaterial
);


const contactOrbit1 = new THREE.Mesh(

    new THREE.TorusGeometry(
        1.25,
        0.025,
        12,
        100
    ),

    new THREE.MeshStandardMaterial({
        color: 0x159b9a,
        roughness: 0.3
    })

);

contactGroup.add(contactOrbit1);


const contactOrbit2 = new THREE.Mesh(

    new THREE.TorusGeometry(
        1.55,
        0.015,
        12,
        100
    ),

    new THREE.MeshStandardMaterial({
        color: 0x2563a6,
        roughness: 0.3
    })

);

contactOrbit2.rotation.x = 1;

contactGroup.add(contactOrbit2);


// ==========================================
// 10. SCENE TRANSITIONS
// ==========================================

const groups = {

    hero: heroGroup,

    services: servicesGroup,

    expertise: expertiseGroup,

    process: processGroup,

    contact: contactGroup

};


// Initially display hero

let activeScene = "hero";


Object.entries(groups).forEach(([name, group]) => {

    group.userData.targetOpacity =
        name === "hero" ? 1 : 0;

    group.userData.targetScale =
        name === "hero" ? 1 : 0.7;

    setGroupOpacity(
        group,
        name === "hero" ? 1 : 0
    );

});


function changeScene(sceneName) {

    if (!groups[sceneName]) return;

    if (activeScene === sceneName) return;

    activeScene = sceneName;


    Object.entries(groups).forEach(([name, group]) => {

        const isActive = name === sceneName;

        group.userData.targetOpacity =
            isActive ? 1 : 0;

        group.userData.targetScale =
            isActive ? 1 : 0.7;

        group.userData.targetRotation =
            isActive ? 0 : 0.35;

    });

}


// Detect active section

const sections = document.querySelectorAll(
    ".section-scene[data-scene]"
);


const sectionObserver = new IntersectionObserver(

    entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                changeScene(
                    entry.target.dataset.scene
                );

            }

        });

    },

    {
        threshold: 0.35,
        rootMargin: "-15% 0px -15% 0px"
    }

);


sections.forEach(section => {

    sectionObserver.observe(section);

});


// ==========================================
// 11. MOUSE INTERACTION
// ==========================================

let mouseX = 0;

let mouseY = 0;


window.addEventListener("pointermove", event => {

    mouseX = (event.clientX / window.innerWidth - 0.5) * 2;

    mouseY = (event.clientY / window.innerHeight - 0.5) * 2;

});


// ==========================================
// 12. ANIMATION LOOP
// ==========================================

const clock = new THREE.Clock();

const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;


function animate() {

    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();


    // --------------------------------------
    // SMOOTH GROUP TRANSITIONS
    // --------------------------------------

    Object.values(groups).forEach(group => {

        const targetOpacity =
            group.userData.targetOpacity;

        const targetScale =
            group.userData.targetScale;

        const currentScale = group.scale.x;

        const nextOpacity = THREE.MathUtils.lerp(
            group.userData.currentOpacity ?? targetOpacity,
            targetOpacity,
            0.045
        );

        group.userData.currentOpacity = nextOpacity;

        setGroupOpacity(group, nextOpacity);


        const newScale = THREE.MathUtils.lerp(
            currentScale,
            targetScale,
            0.045
        );

        group.scale.setScalar(newScale);


        // Gentle rotation during transitions

        group.rotation.y = THREE.MathUtils.lerp(
            group.rotation.y,
            group.userData.targetRotation,
            0.035
        );

    });


    // --------------------------------------
    // HERO ANIMATION
    // --------------------------------------

    if (!reducedMotion) {

        globe.rotation.y += 0.002;

        globe.rotation.x += 0.001;

        heroOrbit.rotation.z += 0.002;

        innerSphere.position.y =
            Math.sin(elapsed) * 0.05;

        heroGroup.position.y =
            0.1 + Math.sin(elapsed * 0.7) * 0.1;


        // ----------------------------------
        // SERVICES ANIMATION
        // ----------------------------------

        serviceObjects.forEach((object, index) => {

            object.rotation.x += 0.003;

            object.rotation.y += 0.004;

            object.position.y =
                servicePositions[index].y +
                Math.sin(elapsed + index) * 0.08;

        });


        // ----------------------------------
        // EXPERTISE ANIMATION
        // ----------------------------------

        expertiseGroup.rotation.y =
            Math.sin(elapsed * 0.4) * 0.12;

        architectureRing.rotation.z += 0.002;


        // ----------------------------------
        // PROCESS ANIMATION
        // ----------------------------------

        processNodes.forEach((node, index) => {

            node.position.y =
                Math.sin(elapsed * 1.5 + index) * 0.12;

        });

        processOrbit.rotation.z += 0.002;


        // ----------------------------------
        // CONTACT ANIMATION
        // ----------------------------------

        contactOrbit1.rotation.x += 0.003;

        contactOrbit1.rotation.y += 0.002;

        contactOrbit2.rotation.z += 0.002;

    }


    // --------------------------------------
    // MOUSE MOVEMENT
    // --------------------------------------

    if (!reducedMotion) {

        const currentGroup = groups[activeScene];

        currentGroup.rotation.x = THREE.MathUtils.lerp(
            currentGroup.rotation.x,
            mouseY * 0.08,
            0.03
        );

        currentGroup.rotation.y += mouseX * 0.0005;

    }


    // --------------------------------------
    // LIGHT ANIMATION
    // --------------------------------------

    if (!reducedMotion) {

        blueLight.position.x =
            3 + Math.sin(elapsed * 0.5);

        tealLight.position.y =
            -2 + Math.cos(elapsed * 0.5);

    }


    renderer.render(scene, camera);

}


animate();


// ==========================================
// 13. RESPONSIVE RESIZING
// ==========================================

function resizeScene() {

    camera.aspect =
        window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );


    // Adjust 3D position on smaller screens

    const mobile = window.innerWidth <= 768;

    Object.values(groups).forEach(group => {

        group.position.x = mobile ? 1.4 : 2.5;

        group.position.y = mobile ? -1.5 : 0;

    });

}


window.addEventListener("resize", resizeScene);

resizeScene();


// ==========================================
// 14. SCROLL REVEAL ANIMATIONS
// ==========================================

const revealElements = document.querySelectorAll(
    ".section-heading, .service-card, .expertise-item, .process-card, .contact-box"
);


revealElements.forEach(element => {

    element.classList.add("reveal");

});


const revealObserver = new IntersectionObserver(

    entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("visible");

                revealObserver.unobserve(entry.target);

            }

        });

    },

    {
        threshold: 0.12
    }

);


revealElements.forEach(element => {

    revealObserver.observe(element);

});


// ==========================================
// 15. MOBILE NAVIGATION
// ==========================================

const menuToggle = document.getElementById("menuToggle");

const navLinks = document.getElementById("navLinks");


menuToggle.addEventListener("click", () => {

    const isOpen = navLinks.classList.toggle("active");

    menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
    );

    menuToggle.textContent = isOpen ? "✕" : "☰";

});


navLinks.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", () => {

        navLinks.classList.remove("active");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        menuToggle.textContent = "☰";

    });

});


// ==========================================
// 16. CLEANUP
// ==========================================

window.addEventListener("pagehide", () => {

    sectionObserver.disconnect();

    revealObserver.disconnect();

    renderer.dispose();

    scene.traverse(object => {

        if (object.geometry) {

            object.geometry.dispose();

        }

        if (object.material) {

            const materials = Array.isArray(object.material)
                ? object.material
                : [object.material];

            materials.forEach(material => {

                material.dispose();

            });

        }

    });

});

/* ==========================================
   17. INTERACTIVE 3D CARD TILT
========================================== */

const tiltCards = document.querySelectorAll(
    ".service-card, .process-card"
);

tiltCards.forEach(card => {

    card.addEventListener("pointermove", event => {

        if (event.pointerType === "touch") return;

        const rect = card.getBoundingClientRect();

        const x = event.clientX - rect.left;

        const y = event.clientY - rect.top;

        const centerX = rect.width / 2;

        const centerY = rect.height / 2;

        const rotateX = ((centerY - y) / centerY) * 5;

        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `
            perspective(1000px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            translateY(-5px)
        `;

    });

    card.addEventListener("pointerleave", () => {

        card.style.transform = "";

    });

});


/* ==========================================
   18. ROLLING SCROLL REVEAL
========================================== */

const rollingElements = document.querySelectorAll(
    ".service-card, .expertise-item, .process-card, .contact-box"
);

rollingElements.forEach((element, index) => {

    element.classList.add("roll-reveal");

    element.style.transitionDelay =
        `${(index % 3) * 100}ms`;

});


const rollingObserver = new IntersectionObserver(

    entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("visible");

                rollingObserver.unobserve(entry.target);

            }

        });

    },

    {
        threshold: 0.15
    }

);


rollingElements.forEach(element => {

    rollingObserver.observe(element);

});


/* ==========================================
   19. MOUSE PARALLAX EFFECT
========================================== */

const depthElements = document.querySelectorAll(
    ".hero-content, .expertise-content"
);

let pointerX = 0;

let pointerY = 0;

let currentX = 0;

let currentY = 0;

window.addEventListener("pointermove", event => {

    pointerX =
        (event.clientX / window.innerWidth - 0.5) * 2;

    pointerY =
        (event.clientY / window.innerHeight - 0.5) * 2;

});


function animateParallax() {

    currentX += (pointerX - currentX) * 0.035;

    currentY += (pointerY - currentY) * 0.035;

    depthElements.forEach((element, index) => {

        const multiplier = index === 0 ? 4 : 2;

        element.style.translate = `
            ${currentX * multiplier}px
            ${currentY * multiplier}px
        `;

    });

    requestAnimationFrame(animateParallax);

}

if (!reducedMotion) {
    animateParallax();
}


/* ==========================================
   20. SCROLL DEPTH EFFECT
========================================== */

let scrollPosition = 0;

let currentScroll = 0;

window.addEventListener("scroll", () => {

    scrollPosition = window.scrollY;

}, { passive: true });


function animateScrollDepth() {

    currentScroll +=
        (scrollPosition - currentScroll) * 0.08;

    const hero = document.querySelector(".hero");

    if (hero && window.innerWidth > 768) {

        const progress = Math.min(
            currentScroll / hero.offsetHeight,
            1
        );

        hero.style.backgroundPosition =
            `center ${progress * 25}px`;

    }

    requestAnimationFrame(animateScrollDepth);

}

if (!reducedMotion) {
    animateScrollDepth();
}
