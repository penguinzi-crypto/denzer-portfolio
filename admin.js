// Admin Panel Script — Denzer Molina
const AUTHORIZED_EMAIL = 'denzermmolina@gmail.com';

document.addEventListener('DOMContentLoaded', async () => {
    const adminLoginScreen = document.getElementById('adminLoginScreen');
    const adminDashboard = document.getElementById('adminDashboard');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const loginEmailInput = document.getElementById('loginEmail');
    const loginPasswordInput = document.getElementById('loginPassword');
    const loginBtn = document.getElementById('loginBtn');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');
    const currentAdminEmail = document.getElementById('currentAdminEmail');
    const projectsAdminGrid = document.getElementById('projectsAdminGrid');
    const openAddProjectModal = document.getElementById('openAddProjectModal');

    // Modal elements
    const projectModal = document.getElementById('projectModal');
    const projectModalBackdrop = document.getElementById('projectModalBackdrop');
    const projectModalClose = document.getElementById('projectModalClose');
    const cancelProjectBtn = document.getElementById('cancelProjectBtn');
    const projectForm = document.getElementById('projectForm');
    const projectModalTitle = document.getElementById('projectModalTitle');
    const projectIdInput = document.getElementById('projectId');
    const projectTitleInput = document.getElementById('projectTitle');
    const projectTagsInput = document.getElementById('projectTags');
    const projectVideoInput = document.getElementById('projectVideoInput');
    const projectSortOrderInput = document.getElementById('projectSortOrder');
    const videoPreviewBox = document.getElementById('videoPreviewBox');
    const previewIframe = document.getElementById('previewIframe');
    const saveProjectBtn = document.getElementById('saveProjectBtn');

    // Toast helper
    function showToast(message, type = 'success') {
        const toast = document.getElementById('adminToast');
        if (!toast) return;
        toast.textContent = message;
        toast.className = `admin-toast ${type} show`;
        setTimeout(() => {
            toast.className = 'admin-toast';
        }, 3500);
    }

    // Extract YouTube ID from full URL or return ID
    function extractYouTubeId(urlOrId) {
        if (!urlOrId) return '';
        const trimmed = urlOrId.trim();
        // If it's already an 11-char ID
        if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
            return trimmed;
        }
        // Match YouTube URL formats
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const match = trimmed.match(regex);
        return match ? match[1] : trimmed;
    }

    // Check current session
    async function checkAuth() {
        if (!supabaseClient) {
            loginError.textContent = 'Supabase client failed to initialize.';
            loginError.style.display = 'block';
            return;
        }

        const { data: { session }, error } = await supabaseClient.auth.getSession();

        if (session && session.user) {
            const userEmail = session.user.email ? session.user.email.toLowerCase() : '';
            if (userEmail === AUTHORIZED_EMAIL.toLowerCase()) {
                // Authorized
                adminLoginScreen.style.display = 'none';
                adminDashboard.style.display = 'block';
                if (currentAdminEmail) currentAdminEmail.textContent = userEmail;
                loadProjects();
            } else {
                // Unauthorized user tried to login
                await supabaseClient.auth.signOut();
                loginError.textContent = `Access denied. ${userEmail} is not authorized.`;
                loginError.style.display = 'block';
                adminLoginScreen.style.display = 'flex';
                adminDashboard.style.display = 'none';
            }
        } else {
            adminLoginScreen.style.display = 'flex';
            adminDashboard.style.display = 'none';
        }
    }

    // Login Form Submit
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            loginError.style.display = 'none';

            const email = loginEmailInput.value.trim().toLowerCase();
            const password = loginPasswordInput.value;

            if (email !== AUTHORIZED_EMAIL.toLowerCase()) {
                loginError.textContent = 'Unauthorized email address. Access is restricted.';
                loginError.style.display = 'block';
                return;
            }

            // Button loading state
            loginBtn.disabled = true;
            loginBtn.querySelector('.btn-text').textContent = 'Authenticating...';

            try {
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) {
                    throw error;
                }

                if (data.user && data.user.email.toLowerCase() === AUTHORIZED_EMAIL.toLowerCase()) {
                    showToast('Authenticated successfully');
                    checkAuth();
                } else {
                    await supabaseClient.auth.signOut();
                    throw new Error('Access denied. Unauthorized identity.');
                }
            } catch (err) {
                loginError.textContent = err.message || 'Authentication failed. Please check your credentials.';
                loginError.style.display = 'block';
            } finally {
                loginBtn.disabled = false;
                loginBtn.querySelector('.btn-text').textContent = 'Authenticate';
            }
        });
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await supabaseClient.auth.signOut();
            showToast('Signed out');
            checkAuth();
        });
    }

    // Fetch and render projects
    async function loadProjects() {
        if (!projectsAdminGrid) return;
        projectsAdminGrid.innerHTML = `
            <div class="admin-loading">
                <div class="admin-spinner"></div>
                <p>Loading projects...</p>
            </div>
        `;

        try {
            const { data: projects, error } = await supabaseClient
                .from('projects')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) throw error;

            if (!projects || projects.length === 0) {
                projectsAdminGrid.innerHTML = `
                    <div class="admin-loading">
                        <p>No projects found. Click "Add Project" to create your first one!</p>
                    </div>
                `;
                return;
            }

            projectsAdminGrid.innerHTML = projects.map(p => `
                <div class="project-admin-card" data-id="${p.id}">
                    <div class="project-admin-thumb-wrapper">
                        <span class="project-admin-order-badge">#${p.sort_order}</span>
                        <img src="https://img.youtube.com/vi/${p.video_id}/maxresdefault.jpg" 
                             alt="${p.title}" 
                             class="project-admin-thumb" 
                             onerror="this.src='https://img.youtube.com/vi/${p.video_id}/hqdefault.jpg'">
                    </div>
                    <div class="project-admin-body">
                        <h4 class="project-admin-title">${escapeHtml(p.title)}</h4>
                        <span class="project-admin-tags">${escapeHtml(p.tags)}</span>
                        <div>
                            <span class="project-admin-video-id">ID: ${p.video_id}</span>
                        </div>
                        <div class="project-admin-actions">
                            <button class="admin-btn admin-btn-secondary admin-btn-sm edit-project-btn" 
                                    data-id="${p.id}"
                                    data-title="${escapeAttr(p.title)}"
                                    data-tags="${escapeAttr(p.tags)}"
                                    data-videoid="${p.video_id}"
                                    data-sort="${p.sort_order}">
                                Edit
                            </button>
                            <button class="admin-btn admin-btn-danger admin-btn-sm delete-project-btn" data-id="${p.id}">
                                Delete
                            </button>
                            <a href="https://www.youtube.com/watch?v=${p.video_id}" target="_blank" class="admin-btn admin-btn-secondary admin-btn-sm" style="margin-left:auto;">
                                Test Video &nearr;
                            </a>
                        </div>
                    </div>
                </div>
            `).join('');

            // Attach event listeners
            document.querySelectorAll('.edit-project-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    openEditModal({
                        id: btn.getAttribute('data-id'),
                        title: btn.getAttribute('data-title'),
                        tags: btn.getAttribute('data-tags'),
                        video_id: btn.getAttribute('data-videoid'),
                        sort_order: btn.getAttribute('data-sort')
                    });
                });
            });

            document.querySelectorAll('.delete-project-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    deleteProject(btn.getAttribute('data-id'));
                });
            });

        } catch (err) {
            console.error('Error fetching projects:', err);
            projectsAdminGrid.innerHTML = `
                <div class="admin-loading" style="color:#f87171;">
                    <p>Failed to load projects: ${err.message}</p>
                    <button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="location.reload()" style="margin-top:12px;">Retry</button>
                </div>
            `;
        }
    }

    // Open Add Project Modal
    if (openAddProjectModal) {
        openAddProjectModal.addEventListener('click', () => {
            projectModalTitle.textContent = 'Add New Project';
            projectIdInput.value = '';
            projectTitleInput.value = '';
            projectTagsInput.value = '';
            projectVideoInput.value = '';
            projectSortOrderInput.value = projectsAdminGrid.querySelectorAll('.project-admin-card').length;
            videoPreviewBox.style.display = 'none';
            previewIframe.src = '';
            projectModal.classList.add('active');
            projectModal.setAttribute('aria-hidden', 'false');
        });
    }

    // Open Edit Project Modal
    function openEditModal(project) {
        projectModalTitle.textContent = 'Edit Project';
        projectIdInput.value = project.id;
        projectTitleInput.value = project.title;
        projectTagsInput.value = project.tags;
        projectVideoInput.value = project.video_id;
        projectSortOrderInput.value = project.sort_order;

        if (project.video_id) {
            previewIframe.src = `https://www.youtube.com/embed/${project.video_id}`;
            videoPreviewBox.style.display = 'block';
        } else {
            videoPreviewBox.style.display = 'none';
        }

        projectModal.classList.add('active');
        projectModal.setAttribute('aria-hidden', 'false');
    }

    // Close Modal
    function closeModal() {
        projectModal.classList.remove('active');
        projectModal.setAttribute('aria-hidden', 'true');
        previewIframe.src = '';
    }

    if (projectModalClose) projectModalClose.addEventListener('click', closeModal);
    if (cancelProjectBtn) cancelProjectBtn.addEventListener('click', closeModal);
    if (projectModalBackdrop) projectModalBackdrop.addEventListener('click', closeModal);

    // Live preview when typing video URL
    if (projectVideoInput) {
        projectVideoInput.addEventListener('input', () => {
            const videoId = extractYouTubeId(projectVideoInput.value);
            if (videoId && videoId.length === 11) {
                previewIframe.src = `https://www.youtube.com/embed/${videoId}`;
                videoPreviewBox.style.display = 'block';
            } else {
                videoPreviewBox.style.display = 'none';
                previewIframe.src = '';
            }
        });
    }

    // Save Project (Insert or Update)
    if (projectForm) {
        projectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = projectIdInput.value;
            const title = projectTitleInput.value.trim();
            const tags = projectTagsInput.value.trim();
            const rawVideo = projectVideoInput.value.trim();
            const video_id = extractYouTubeId(rawVideo);
            const sort_order = parseInt(projectSortOrderInput.value, 10) || 0;

            if (!video_id) {
                showToast('Please provide a valid YouTube video ID or link', 'error');
                return;
            }

            saveProjectBtn.disabled = true;
            saveProjectBtn.querySelector('.btn-text').textContent = 'Saving...';

            try {
                if (id) {
                    // Update
                    const { error } = await supabaseClient
                        .from('projects')
                        .update({ title, tags, video_id, sort_order })
                        .eq('id', id);

                    if (error) throw error;
                    showToast('Project updated successfully!');
                } else {
                    // Insert
                    const { error } = await supabaseClient
                        .from('projects')
                        .insert([{ title, tags, video_id, sort_order }]);

                    if (error) throw error;
                    showToast('Project created successfully!');
                }

                closeModal();
                loadProjects();
            } catch (err) {
                console.error('Save error:', err);
                showToast(err.message || 'Error saving project', 'error');
            } finally {
                saveProjectBtn.disabled = false;
                saveProjectBtn.querySelector('.btn-text').textContent = 'Save Project';
            }
        });
    }

    // Delete Project
    async function deleteProject(id) {
        if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) {
            return;
        }

        try {
            const { error } = await supabaseClient
                .from('projects')
                .delete()
                .eq('id', id);

            if (error) throw error;

            showToast('Project deleted');
            loadProjects();
        } catch (err) {
            console.error('Delete error:', err);
            showToast(err.message || 'Error deleting project', 'error');
        }
    }

    // Helper sanitizers
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, (m) => {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[m];
        });
    }

    function escapeAttr(str) {
        return escapeHtml(str).replace(/"/g, '&quot;');
    }

    // Run initial auth check
    checkAuth();
});
