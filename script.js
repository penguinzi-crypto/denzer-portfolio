document.addEventListener('DOMContentLoaded', () => {

    // === Custom Cursor ===
    const cursor = document.getElementById('cursor');
    const cursorFollower = document.getElementById('cursorFollower');
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });

    function animateFollower() {
        followerX += (mouseX - followerX) * 0.12;
        followerY += (mouseY - followerY) * 0.12;
        cursorFollower.style.left = followerX + 'px';
        cursorFollower.style.top = followerY + 'px';
        requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Cursor hover states
    const hoverElements = document.querySelectorAll('a, button, [data-magnetic]');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            cursorFollower.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            cursorFollower.classList.remove('hover');
        });
    });

    // === Magnetic Elements ===
    const magneticElements = document.querySelectorAll('[data-magnetic]');
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0, 0)';
            el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        });
        el.addEventListener('mouseenter', () => {
            el.style.transition = 'none';
        });
    });

    // === Navigation Scroll Effect ===
    const nav = document.getElementById('nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    });

    // === Smooth Scroll for Nav Links ===
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // === Theme Toggle ===
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    // Check saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Add animation class
        themeToggle.classList.add('animating');
        
        // Create flash overlay
        const overlay = document.createElement('div');
        overlay.className = 'theme-transition-overlay';
        document.body.appendChild(overlay);
        
        // Tiny delay for the overlay to render
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });
        
        // Switch theme
        setTimeout(() => {
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        }, 150);
        
        // Clean up
        setTimeout(() => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        }, 400);
        
        setTimeout(() => {
            themeToggle.classList.remove('animating');
        }, 700);
    });

    // === Scroll Reveal ===
    // Group reveal elements by their parent section so stagger resets per section
    const sections = document.querySelectorAll('.hero, .about, .skills, .projects, .contact');
    const revealElements = document.querySelectorAll('[data-reveal]');
    
    // Assign delays per-section (reset counter for each section)
    sections.forEach(section => {
        const sectionReveals = section.querySelectorAll('[data-reveal]');
        sectionReveals.forEach((el, index) => {
            el.dataset.delay = index * 100;
        });
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.dataset.delay) || 0;
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, delay);
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px -20px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // === Counter Animation ===
    const counters = document.querySelectorAll('[data-count]');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-count'));
                animateCounter(entry.target, target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

    function animateCounter(element, target) {
        let current = 0;
        const duration = 2000;
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out expo
            const eased = 1 - Math.pow(1 - progress, 4);
            current = Math.round(eased * target);
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    // === Skill Level Bars Animation ===
    const skillBars = document.querySelectorAll('.skill-level-bar');
    
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const level = entry.target.getAttribute('data-level');
                entry.target.style.setProperty('--level', level + '%');
                entry.target.classList.add('animated');
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    skillBars.forEach(bar => skillObserver.observe(bar));

    // === Card Tilt Effect ===
    const tiltCards = document.querySelectorAll('[data-tilt]');
    
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -5;
            const rotateY = (x - centerX) / centerX * 5;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        });
        
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });
    });

    // === Parallax on Hero Shapes ===
    const shapes = document.querySelectorAll('.shape');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        shapes.forEach((shape, i) => {
            const speed = (i + 1) * 0.05;
            shape.style.transform += ` translateY(${scrollY * speed}px)`;
        });
    });

    // === Page Load Animation ===
    document.body.style.opacity = '0';
    window.addEventListener('load', () => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    });

    // === 3D Spiral Gallery ===
    let spiralAnimId = null;
    let spiralCards = [];
    const spiralScene = document.getElementById('spiralScene');
    const spiralViewport = document.getElementById('spiralViewport');
    const activeLabel = document.getElementById('spiralActiveLabel');
    const activeTitleEl = activeLabel ? activeLabel.querySelector('.spiral-active-title') : null;

    function initSpiralGallery() {
        if (spiralAnimId) {
            cancelAnimationFrame(spiralAnimId);
            spiralAnimId = null;
        }

        spiralCards = document.querySelectorAll('.spiral-card');
        if (!spiralCards.length || !spiralScene || !spiralViewport) return;

        const TOTAL = spiralCards.length;
        const RADIUS_X = 380;       // Horizontal radius of the helix
        const RADIUS_Z = 320;       // Depth radius
        const VERTICAL_SPREAD = 60; // Vertical spacing per card
        const ANGLE_PER_CARD = (2 * Math.PI) / TOTAL * 1.15; // Slightly > full wrap

        let spiralRotation = 0;
        let targetRotation = 0;
        let idleOffset = 0;

        function positionCards() {
            spiralCards.forEach((card, i) => {
                const angle = i * ANGLE_PER_CARD + spiralRotation;
                const x = Math.sin(angle) * RADIUS_X;
                const z = Math.cos(angle) * RADIUS_Z - 200;
                const y = (i - TOTAL / 2) * VERTICAL_SPREAD + Math.sin(spiralRotation * 0.5) * 5;

                // Depth-based scaling and opacity
                const normalizedZ = (z + RADIUS_Z + 200) / (RADIUS_Z * 2 + 200);
                const scale = 0.5 + normalizedZ * 0.6;
                const opacity = 0.25 + normalizedZ * 0.75;

                card.style.transform = `translate3d(${x}px, ${y}px, ${z}px) scale(${scale})`;
                card.style.opacity = opacity;
                card.style.zIndex = Math.round(normalizedZ * 100);
                card.style.filter = normalizedZ < 0.4 ? `blur(${(1 - normalizedZ * 2.5) * 3}px)` : 'none';
            });
        }

        // Idle floating animation
        function idleAnimate() {
            idleOffset += 0.003;
            spiralRotation += (targetRotation - spiralRotation) * 0.08;
            // Subtle idle drift
            const drift = Math.sin(idleOffset) * 0.002;
            spiralRotation += drift;
            positionCards();
            spiralAnimId = requestAnimationFrame(idleAnimate);
        }

        window.addEventListener('scroll', () => {
            const rect = spiralViewport.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const scrollProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
                targetRotation = scrollProgress * Math.PI * 2.5;
            }
        });

        // Hover: update active label
        spiralCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const title = card.querySelector('.spiral-card-title');
                if (title && activeTitleEl) {
                    activeTitleEl.textContent = title.textContent;
                }
            });
        });

        positionCards();
        idleAnimate();
    }

    initSpiralGallery();

    // === Spiral / List Mode Toggle ===
    const modeBtns = document.querySelectorAll('.mode-btn');
    const spiralViewportEl = document.getElementById('spiralViewport');
    const spiralListView = document.getElementById('spiralListView');
    const spiralActiveLabelEl = document.getElementById('spiralActiveLabel');

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const mode = btn.getAttribute('data-mode');

            if (mode === 'list') {
                if (spiralViewportEl) spiralViewportEl.style.display = 'none';
                if (spiralActiveLabelEl) spiralActiveLabelEl.style.display = 'none';
                if (spiralListView) spiralListView.style.display = 'block';
            } else {
                if (spiralViewportEl) spiralViewportEl.style.display = 'block';
                if (spiralActiveLabelEl) spiralActiveLabelEl.style.display = 'inline-flex';
                if (spiralListView) spiralListView.style.display = 'none';
            }
        });
    });

    // === Video Player Modal (Inline YouTube Playback) ===
    const videoModal = document.getElementById('videoModal');
    const videoModalBackdrop = document.getElementById('videoModalBackdrop');
    const videoModalClose = document.getElementById('videoModalClose');
    const videoModalIframe = document.getElementById('videoModalIframe');
    const videoModalTitle = document.getElementById('videoModalTitle');
    const videoModalTags = document.getElementById('videoModalTags');

    function openVideoModal(videoId, title, tags) {
        if (!videoModal || !videoModalIframe) return;
        videoModalIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        if (videoModalTitle) videoModalTitle.textContent = title || 'Project Video';
        if (videoModalTags) videoModalTags.textContent = tags || '';
        videoModal.classList.add('active');
        videoModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeVideoModal() {
        if (!videoModal || !videoModalIframe) return;
        videoModal.classList.remove('active');
        videoModal.setAttribute('aria-hidden', 'true');
        videoModalIframe.src = ''; // Instantly stops YouTube playback
        document.body.style.overflow = '';
    }

    if (videoModalClose) videoModalClose.addEventListener('click', closeVideoModal);
    if (videoModalBackdrop) videoModalBackdrop.addEventListener('click', closeVideoModal);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal && videoModal.classList.contains('active')) {
            closeVideoModal();
        }
    });

    // Delegated click handler for video triggers (works for static and dynamically loaded cards)
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-video-id]');
        if (trigger) {
            e.preventDefault();
            const videoId = trigger.getAttribute('data-video-id');
            const title = trigger.getAttribute('data-title') || trigger.querySelector('.spiral-card-title, .list-project-title')?.textContent;
            const tags = trigger.getAttribute('data-tags') || trigger.querySelector('.spiral-card-tags, .list-project-tags')?.textContent;
            if (videoId) {
                openVideoModal(videoId, title, tags);
            }
        }
    });

    // === Supabase Dynamic Projects Loader ===
    async function loadProjectsFromSupabase() {
        if (typeof supabaseClient === 'undefined' || !supabaseClient) return;

        try {
            const { data: projects, error } = await supabaseClient
                .from('projects')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error || !projects || projects.length === 0) {
                return; // Keep existing static projects as fallback
            }

            if (spiralScene) {
                spiralScene.innerHTML = projects.map((p, index) => `
                    <div class="spiral-card" data-index="${index}">
                        <a href="#" class="spiral-card-link" data-video-id="${p.video_id}" data-title="${p.title}" data-tags="${p.tags}">
                            <img src="https://img.youtube.com/vi/${p.video_id}/maxresdefault.jpg" alt="${p.title}" class="spiral-thumb" loading="lazy" onerror="this.src='https://img.youtube.com/vi/${p.video_id}/hqdefault.jpg'">
                            <div class="spiral-play-btn">
                                <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                            </div>
                            <div class="spiral-card-info">
                                <span class="spiral-card-title">${p.title}</span>
                                <span class="spiral-card-tags">${p.tags}</span>
                            </div>
                        </a>
                    </div>
                `).join('');
            }

            if (spiralListView) {
                spiralListView.innerHTML = projects.map((p, index) => `
                    <a href="#" class="list-project-row" data-video-id="${p.video_id}" data-title="${p.title}" data-tags="${p.tags}" data-reveal>
                        <span class="list-project-index">${String(index + 1).padStart(2, '0')}</span>
                        <span class="list-project-title">${p.title}</span>
                        <span class="list-project-tags">${p.tags}</span>
                        <span class="list-project-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5,3 19,12 5,21" fill="currentColor"/></svg></span>
                    </a>
                `).join('');
            }

            // Re-bind spiral cards and active label
            initSpiralGallery();
        } catch (err) {
            console.log('Using static projects:', err);
        }
    }

    loadProjectsFromSupabase();

    // === Starfield Background ===
    const starfieldCanvas = document.getElementById('starfieldCanvas');
    if (starfieldCanvas) {
        const ctx = starfieldCanvas.getContext('2d');
        let width, height, centerX, centerY;
        let stars = [];
        let animationId;

        // Theme-aware color palettes
        const lightPalette = {
            bg: [248, 247, 244],       // matches --bg-primary light
            star: [80, 80, 120],
            starAlpha: 0.35,
            line: [99, 102, 241],
            lineAlpha: 0.04,
            nebula1: [99, 102, 241, 0.03],
            nebula2: [168, 85, 247, 0.02],
            speed: 0.3,
            count: 200,
            maxSize: 1.8,
        };

        const darkPalette = {
            bg: [10, 10, 11],          // matches --bg-primary dark
            star: [255, 255, 255],
            starAlpha: 0.85,
            line: [129, 140, 248],
            lineAlpha: 0.06,
            nebula1: [56, 100, 180, 0.06],
            nebula2: [100, 60, 150, 0.04],
            speed: 0.8,
            count: 350,
            maxSize: 2.2,
        };

        // Current interpolated palette (for smooth transitions)
        let currentPalette = { ...lightPalette };
        let targetPalette = lightPalette;
        let transitionProgress = 1;

        function lerp(a, b, t) {
            return a + (b - a) * t;
        }

        function lerpColor(a, b, t) {
            return a.map((v, i) => lerp(v, b[i], t));
        }

        function getCurrentTheme() {
            return document.documentElement.getAttribute('data-theme') || 'light';
        }

        function setTargetPalette() {
            const theme = getCurrentTheme();
            targetPalette = theme === 'dark' ? darkPalette : lightPalette;
            transitionProgress = 0;
        }

        function updatePaletteTransition() {
            if (transitionProgress < 1) {
                transitionProgress = Math.min(1, transitionProgress + 0.02);
                const t = transitionProgress;
                currentPalette.bg = lerpColor(currentPalette.bg, targetPalette.bg, t * 0.1);
                currentPalette.star = lerpColor(currentPalette.star, targetPalette.star, t * 0.1);
                currentPalette.starAlpha = lerp(currentPalette.starAlpha, targetPalette.starAlpha, t * 0.1);
                currentPalette.line = lerpColor(currentPalette.line, targetPalette.line, t * 0.1);
                currentPalette.lineAlpha = lerp(currentPalette.lineAlpha, targetPalette.lineAlpha, t * 0.1);
                currentPalette.speed = lerp(currentPalette.speed, targetPalette.speed, t * 0.1);
                currentPalette.maxSize = lerp(currentPalette.maxSize, targetPalette.maxSize, t * 0.1);
            }
        }

        function resize() {
            width = starfieldCanvas.width = window.innerWidth;
            height = starfieldCanvas.height = window.innerHeight;
            centerX = width / 2;
            centerY = height / 2;
        }

        class Star {
            constructor() {
                this.reset();
            }

            reset() {
                // Random position in 3D space
                this.x = (Math.random() - 0.5) * width * 2;
                this.y = (Math.random() - 0.5) * height * 2;
                this.z = Math.random() * 1500 + 500;
                this.pz = this.z; // previous z for streak effect

                // Star properties
                this.twinkleSpeed = Math.random() * 0.02 + 0.005;
                this.twinklePhase = Math.random() * Math.PI * 2;
                this.baseSize = Math.random() * 1.5 + 0.5;
            }

            update(speed) {
                this.pz = this.z;
                this.z -= speed * 2;

                if (this.z < 1) {
                    this.reset();
                    this.z = 1500;
                    this.pz = this.z;
                }
            }

            draw(ctx, time) {
                // Project 3D to 2D
                const sx = (this.x / this.z) * centerX + centerX;
                const sy = (this.y / this.z) * centerY + centerY;

                // Previous position for streaks
                const px = (this.x / this.pz) * centerX + centerX;
                const py = (this.y / this.pz) * centerY + centerY;

                // Check bounds
                if (sx < -50 || sx > width + 50 || sy < -50 || sy > height + 50) return;

                // Size based on depth
                const depthFactor = 1 - this.z / 2000;
                const size = this.baseSize * depthFactor * currentPalette.maxSize;

                // Twinkle
                const twinkle = Math.sin(time * this.twinkleSpeed + this.twinklePhase) * 0.3 + 0.7;
                const alpha = depthFactor * twinkle * currentPalette.starAlpha;

                const [r, g, b] = currentPalette.star;

                // Draw streak (line from old to new position)
                const dx = sx - px;
                const dy = sy - py;
                const streakLen = Math.sqrt(dx * dx + dy * dy);

                if (streakLen > 1 && streakLen < 50) {
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.lineTo(sx, sy);
                    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.4})`;
                    ctx.lineWidth = size * 0.5;
                    ctx.stroke();
                }

                // Draw star
                ctx.beginPath();
                ctx.arc(sx, sy, Math.max(0.3, size), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                ctx.fill();

                // Glow for bright stars
                if (size > 1 && depthFactor > 0.5) {
                    ctx.beginPath();
                    ctx.arc(sx, sy, size * 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.08})`;
                    ctx.fill();
                }

                // Store screen position for connection lines
                this.screenX = sx;
                this.screenY = sy;
                this.screenAlpha = alpha;
                this.screenSize = size;
            }
        }

        function createStars(count) {
            stars = [];
            for (let i = 0; i < count; i++) {
                stars.push(new Star());
            }
        }

        function drawConnections(ctx) {
            const [r, g, b] = currentPalette.line;
            const maxDist = 100;

            for (let i = 0; i < stars.length; i++) {
                for (let j = i + 1; j < stars.length; j++) {
                    const dx = stars[i].screenX - stars[j].screenX;
                    const dy = stars[i].screenY - stars[j].screenY;
                    const dist = dx * dx + dy * dy;

                    if (dist < maxDist * maxDist) {
                        const alpha = (1 - Math.sqrt(dist) / maxDist) * currentPalette.lineAlpha
                            * stars[i].screenAlpha * stars[j].screenAlpha;

                        if (alpha > 0.001) {
                            ctx.beginPath();
                            ctx.moveTo(stars[i].screenX, stars[i].screenY);
                            ctx.lineTo(stars[j].screenX, stars[j].screenY);
                            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                            ctx.lineWidth = 0.5;
                            ctx.stroke();
                        }
                    }
                }
            }
        }

        function animate(time) {
            animationId = requestAnimationFrame(animate);

            updatePaletteTransition();

            // Clear with transparent (let CSS background show through)
            ctx.clearRect(0, 0, width, height);

            // Update and draw stars
            for (const star of stars) {
                star.update(currentPalette.speed);
                star.draw(ctx, time);
            }

            // Draw subtle connection lines (only check nearby stars for performance)
            drawConnections(ctx);
        }

        // Initialize
        resize();
        // Set initial palette based on current theme
        const initialTheme = getCurrentTheme();
        if (initialTheme === 'dark') {
            currentPalette = { ...darkPalette };
            targetPalette = darkPalette;
        } else {
            currentPalette = { ...lightPalette };
            targetPalette = lightPalette;
        }
        createStars(300);
        animate(0);

        // Handle resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                resize();
            }, 100);
        });

        // Watch for theme changes
        const themeObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.attributeName === 'data-theme') {
                    setTargetPalette();
                }
            }
        });

        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }

});
