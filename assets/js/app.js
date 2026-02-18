document.addEventListener("DOMContentLoaded", () => {
    fetchData();
});

// Fetch Data from JSON
// Global variables
let allActivities = [];
let autoScrollInterval;

async function fetchData() {
    try {
        const response = await fetch('assets/data.json');
        const data = await response.json();

        allActivities = data.activities_gallery; // Store for filtering

        renderHeader(data.header);
        renderHero(data.hero);
        renderAbout(data.about);
        renderEducation(data.education);
        renderActivities(allActivities); // Initial render
        renderSkills(data.skills);
        renderProjects(data.projects);
        renderContact(data.contact);

        // Init animations after rendering
        initScrollAnimation();
        initTypeLoop(data.hero);
        initNavbarEffect();
        initCategoryFilter(); // Setup filter listener

    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function initTooltips() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

// Global function for Cert Modal
window.showCertModal = function (imageSrc) {
    const modalImg = document.getElementById('modalImage');
    const downloadLink = document.getElementById('downloadLink');
    if (modalImg && downloadLink) {
        modalImg.src = imageSrc;
        downloadLink.href = imageSrc;
        const myModal = new bootstrap.Modal(document.getElementById('imageModal'));
        myModal.show();
    }
};

// Render Functions
function renderHeader(links) {
    const navList = document.getElementById('nav-list');
    navList.innerHTML = links.map(link =>
        `<li class="nav-item"><a class="nav-link px-3" href="${link.link}">${link.name}</a></li>`
    ).join('');
}

function renderHero(hero) {
    document.getElementById('hero-title').innerHTML = `${hero.title} <span class="type-loop text-theme"></span>`;
    document.getElementById('hero-subtitle').innerHTML = hero.subtitle;
}

function renderAbout(about) {
    const container = document.getElementById('about-content');
    container.innerHTML = `
        <div class="col-lg-4 text-center text-lg-end slide-left">
            <p class="fs-5 fst-italic">${about.text_left}</p>
        </div>
        <div class="col-lg-4 text-center slide-up" style="transition-delay: 0.2s;">
            <img src="${about.image}" class="img-fluid rounded-circle border-theme" style="max-width: 250px;">
        </div>
        <div class="col-lg-4 text-center text-lg-start slide-right" style="transition-delay: 0.4s;">
            <p class="fs-5 fst-italic">${about.text_right}</p>
        </div>
    `;
}

function renderEducation(education) {
    const container = document.getElementById('education-list');
    container.innerHTML = education.map((edu, index) => {
        let activitiesHtml = '';
        if (edu.activities && Array.isArray(edu.activities) && edu.activities.length > 0) {
            activitiesHtml = `
                <div class="text-start mt-3">
                    <small class="fw-bold text-theme">Activities:</small>
                    <ul class="small mb-0 text-white ps-3">
                        ${edu.activities.map(act => `<li>${act}</li>`).join('')}
                    </ul>
                </div>
            `;
        } else if (edu.details) {
            activitiesHtml = `<p class="small mb-0 text-start text-white mt-3">${edu.details}</p>`;
        }

        return `
        <div class="col-md-4 fade-up" style="transition-delay: ${index * 0.1}s;">
            <div class="card card-custom h-100 p-4 text-center rounded-4 border-theme">
                <div style="height: 80px; display: flex; align-items: center; justify-content: center;">
                    <img src="${edu.logo}" alt="${edu.institution}" style="max-height: 60px; ${edu.category === 'Matriculation' ? '' : 'padding: 10px;'}">
                </div>
                <h4 class="text-white fw-bold">${edu.category}</h4>
                <h5 class="fw-bold text-white my-2">${edu.institution}</h5>
                <p class="small text-white mb-1">${edu.location} | ${edu.years}</p>
                <p class="fw-medium text-white mb-2">${edu.course}</p>
                ${edu.cgpa === "-" ? `<p class="small fw-bold text-success mb-0">Result: -</p>` : (edu.cgpa ? `<p class="small fw-bold text-success mb-0">CGPA: ${edu.cgpa}</p>` : '')}
                ${activitiesHtml}
            </div>
        </div>
    `}).join('');
}

function renderActivities(activities) {
    const container = document.getElementById('activities-container');
    if (!container) return;

    // Clear existing interval if re-rendering
    if (autoScrollInterval) clearInterval(autoScrollInterval);

    container.innerHTML = activities.map(act => `
        <div class="activity-card">
            <div class="card card-custom h-100 overflow-hidden rounded-4 border-theme">
                <div class="position-relative" style="height: 200px;">
                    <img src="${act.image}" class="w-100 h-100 object-fit-cover" alt="Activity">
                    <span class="position-absolute top-0 end-0 m-3 badge bg-black border border-theme text-theme">${act.category} | ${act.date}</span>
                </div>
                <div class="card-body p-4">
                    <p class="card-text small text-white text-center">${act.description}</p>
                </div>
            </div>
        </div>
    `).join('');

    // Re-initialize carousel logic (only start scrolling, listeners attached once elsewhere if possible, but here we might need to be careful)
    // Actually, since we replace innerHTML, the container is same.
    // We should separate listener attachment.
    updateCarouselState();
}

function initCategoryFilter() {
    const filter = document.getElementById('activity-filter');
    if (!filter) return;

    filter.addEventListener('change', (e) => {
        const category = e.target.value;
        const filtered = category === 'All'
            ? allActivities
            : allActivities.filter(a => a.category === category);
        renderActivities(filtered);
    });

    // Initialize carousel listeners once
    initCarouselListeners();
}

function initCarouselListeners() {
    const container = document.getElementById('activities-container');
    const prevBtn = document.getElementById('prev-activity');
    const nextBtn = document.getElementById('next-activity');

    if (!container || !prevBtn || !nextBtn) return;

    const getScrollAmount = () => {
        const card = container.querySelector('.activity-card');
        return card ? card.offsetWidth + 24 : 0;
    };

    const scrollLeft = () => container.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    const scrollRight = () => {
        const scrollAmount = getScrollAmount();
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
            container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    prevBtn.addEventListener('click', () => {
        stopAutoScroll();
        scrollLeft();
        startAutoScroll();
    });

    nextBtn.addEventListener('click', () => {
        stopAutoScroll();
        scrollRight();
        startAutoScroll();
    });

    container.addEventListener('mouseenter', stopAutoScroll);
    container.addEventListener('mouseleave', startAutoScroll);
}

function updateCarouselState() {
    startAutoScroll();
}

function startAutoScroll() {
    if (autoScrollInterval) clearInterval(autoScrollInterval);
    const container = document.getElementById('activities-container');
    if (!container) return;

    // Only scroll if there is content to scroll
    if (container.scrollWidth > container.clientWidth) {
        autoScrollInterval = setInterval(() => {
            const card = container.querySelector('.activity-card');
            const scrollAmount = card ? card.offsetWidth + 24 : 0;

            if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
                container.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }, 5000);
    }
}

function stopAutoScroll() {
    if (autoScrollInterval) clearInterval(autoScrollInterval);
}

// Helper to get dot color class
function getProficiencyColorClass(level) {
    if (level === 'Proficient') return 'bg-success';
    if (level === 'Intermediate') return 'bg-warning';
    return 'bg-danger';
}

function renderSkills(skills) {
    const container = document.getElementById('skills-container');

    // Technical Skills
    const techHtml = `
        <div class="col-lg-6 mb-4">
            <div class="h-100 p-4 border border-theme rounded-4 m-0">
                <div class="d-flex justify-content-between align-items-center pb-2 mb-4">
                    <h3 class="text-theme mb-0 fst-italic">Technical Skills</h3>
                    <i class="fas fa-info-circle text-theme" data-bs-toggle="tooltip" data-bs-html="true" title="<span class='dot-indicator bg-success'></span> Proficient <br> <span class='dot-indicator bg-warning'></span> Intermediate <br> <span class='dot-indicator bg-danger'></span> Beginner"></i>
                </div>
                <div class="row row-cols-3 row-cols-sm-3 row-cols-md-4 g-3 justify-content-center">
                    ${skills.technical.map(skill => `
                        <div class="col text-center">
                            <div class="p-2 skill-item position-relative" data-bs-toggle="tooltip" data-bs-placement="top" title="${skill.level}">
                                <img src="${skill.icon}" class="skill-icon mb-2" alt="${skill.name}">
                                <div class="d-flex justify-content-center align-items-center gap-1">
                                    <p class="mb-0 small fw-bold">${skill.name}</p>
                                    <span class="dot-indicator ${getProficiencyColorClass(skill.level)}"></span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    // Certifications
    const certHtml = `
        <div class="col-lg-6 mb-4">
             <div class="h-100 p-4 border border-theme rounded-4">
                <div class="d-flex justify-content-between align-items-center pb-2 mb-4">
                    <h3 class="text-theme mb-0 fst-italic">Certifications</h3>
                </div>
                <div class="row g-3">
                    ${skills.certifications.map(cert => {
                        let actionBtn;
                        // Logic: If link is valid and external, show link. Otherwise (or if explicit #), show modal.
                        // Assuming 'assets/img' might be the link if they want to view the image directly, but user said 'cert who dont have links'.
                        // We'll check if link is present and not empty/hash.
                        if (cert.link && cert.link !== '#' && cert.link.trim() !== '') {
                            actionBtn = `<a href="${cert.link}" target="_blank" class="small text-theme text-decoration-none fw-bold">Show Credential <i class="fas fa-arrow-right ms-1"></i></a>`;
                        } else {
                            actionBtn = `<button class="btn btn-sm btn-link small text-theme text-decoration-none fw-bold p-0 border-0" onclick="showCertModal('${cert.image}')">View Cert <i class="fas fa-eye ms-1"></i></button>`;
                        }

                        return `
                        <div class="col-md-6">
                            <div class="card card-custom p-3 h-100 border-0 bg-transparent">
                                <div class="d-flex align-items-center mb-2">
                                    <img src="${cert.icon}" class="skill-icon m-2" alt="${cert.name}">
                                    <div>
                                        <h6 class="fw-bold mb-0 text-white">${cert.name}</h6>
                                        <small class="text-white">${cert.issuer} - ${cert.year}</small>
                                    </div>
                                </div>
                                <p class="small mb-2 text-white-50">${cert.description}</p>
                                ${actionBtn}
                            </div>
                        </div>
                    `}).join('')}
                </div>
            </div>
        </div>
    `;

    // Soft Skills (Split rows)
    const softSkillsPrimary = skills.soft_skills.slice(0, 2); // First 2 (Malay, English)
    const softSkillsSecondary = skills.soft_skills.slice(2); // Rest

    const softHtml = `
         <div class="col-12">
            <div class="h-100 p-4 border border-theme rounded-4">
                <div class="d-flex justify-content-between align-items-center pb-2 mb-4">
                     <h3 class="text-theme mb-0 fst-italic">Soft Skills</h3>
                     <i class="fas fa-info-circle text-theme" data-bs-toggle="tooltip" data-bs-html="true" title="<span class='dot-indicator bg-success'></span> Proficient <br> <span class='dot-indicator bg-warning'></span> Intermediate <br> <span class='dot-indicator bg-danger'></span> Beginner"></i>
                </div>
                <!-- Row 1: Languages -->
                <div class="d-flex flex-wrap gap-2 justify-content-start mb-2">
                    ${softSkillsPrimary.map(skill => `
                        <span class="badge border border-white text-white bg-transparent p-2 rounded-pill fs-6 d-flex align-items-center gap-2" data-bs-toggle="tooltip" title="Language">
                            ${skill}
                            <span class="dot-indicator bg-success"></span>
                        </span>
                    `).join('')}
                </div>
                <!-- Row 2: Others -->
                <div class="d-flex flex-wrap gap-2 justify-content-start">
                    ${softSkillsSecondary.map(skill => `
                        <span class="badge border border-white text-white bg-transparent p-2 rounded-pill fs-6" data-bs-toggle="tooltip" title="Soft Skill">${skill}</span>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    container.innerHTML = techHtml + certHtml + softHtml;

    // Initialize tooltips after rendering
    initTooltips();
}

function renderProjects(projects) {
    const container = document.getElementById('projects-list');
    container.innerHTML = projects.map((proj, index) => `
        <div class="col-md-6 fade-up" style="transition-delay: ${index * 0.1}s;">
            <div class="card card-custom h-100 overflow-hidden rounded-4">
                <div style="height: 200px; overflow: hidden; display: flex; justify-content: center;">
                    <img src="${proj.image}" class="h-100 object-fit-cover p-4" alt="${proj.title}">
                </div>
                <div class="card-body px-4 pt-0 pb-4">
                    <h4 class="fw-bold text-theme">${proj.title}</h4>
                    <p class="small mb-3 text-white">${proj.description}</p>
                    <div class="mb-3">
                        ${proj.tech_stack.map(tech => `<span class="badge bg-secondary me-1">${tech}</span>`).join('')}
                    </div>
                    <a href="${proj.link}" class="btn btn-sm btn-outline-light rounded-pill px-4">View Project</a>
                </div>
            </div>
        </div>
    `).join('');
}

function renderContact(contact) {
    const container = document.getElementById('contact-content');
    container.innerHTML = `
        <p class="fs-5 mb-4">Feel free to reach out via email or social media.</p>
        <div class="d-flex flex-column flex-md-row justify-content-center align-items-center gap-3">
            <a href="mailto:${contact.email}" class="btn btn-outline-light btn-lg rounded-pill px-5">
                <i class="fas fa-envelope me-2"></i> Email Me
            </a>
            <div class="d-flex gap-4">
                ${contact.socials.map(social => `
                    <a href="${social.link}" target="_blank" class="text-white fs-2 hover-theme step-hover" target="_blank"><i class="${social.icon}"></i></a>
                `).join('')}
            </div>
        </div>
    `;
}

// Helper: Navbar Scroll Effect & Active Link
function initNavbarEffect() {
    const navbar = document.querySelector('.navbar');

    // Scroll effect for navbar background
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Active Link Automation using IntersectionObserver
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    const observerOptions = {
        root: null,
        threshold: 0.3, // Trigger when 30% of the section is visible
        rootMargin: "-50px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // Collapse navbar on link click (mobile) & Manual Active Set
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Remove active from all
            navLinks.forEach(n => n.classList.remove('active'));
            // Add to clicked
            link.classList.add('active');

            const navbarCollapse = document.getElementById('navbarNav');
            if (navbarCollapse.classList.contains('show')) {
                new bootstrap.Collapse(navbarCollapse).hide();
            }
        });
    });
}

// Helper: Scroll Animation
function initScrollAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                // Remove class to reset animation on every scroll
                entry.target.classList.remove('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-up, .slide-left, .slide-right, .slide-up').forEach(el => observer.observe(el));
}

// Helper: Type Loop (Re-implemented)
function initTypeLoop(hero) {
    const el = document.querySelector(".type-loop");
    if (!el) return;

    // Parse from data object instead of attributes
    const words = hero.type_words.split(",");
    const colors = hero.type_colors.split(",");

    let w = 0, i = 0, deleting = false;
    const typeSpeed = 100, deleteSpeed = 50, hold = 1500;

    function tick() {
        const word = words[w];
        el.style.color = colors[w % colors.length];

        if (deleting) {
            i--;
        } else {
            i++;
        }

        el.textContent = word.substring(0, i);

        let speed = typeSpeed;
        if (deleting) speed = deleteSpeed;

        if (!deleting && i === word.length) {
            speed = hold;
            deleting = true;
        } else if (deleting && i === 0) {
            deleting = false;
            w = (w + 1) % words.length;
            speed = 500;
        }

        setTimeout(tick, speed);
    }
    tick();
}

function getProficiencyColor(level) {
    if (level === 'Proficient') return '#1bdd14';
    if (level === 'Intermediate') return '#FFD43B';
    return '#dd5014';
}