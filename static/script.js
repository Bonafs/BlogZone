// --- BLOG PAGE LOGIC WITH LOCAL STORAGE, REGISTRATION, LOGIN, DELETE CONFIRMATION ---

// --- USER REGISTRATION & LOGIN LOGIC ---

function getUsersFromStorage() {
    return JSON.parse(localStorage.getItem('blogHubUsers') || '{}');
}

function saveUsersToStorage(users) {
    localStorage.setItem('blogHubUsers', JSON.stringify(users));
}

function hashPassword(pw) {
    // Simple hash for demo (not secure for production)
    let hash = 0, i, chr;
    if (pw.length === 0) return hash;
    for (i = 0; i < pw.length; i++) {
        chr = pw.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return hash.toString();
}

function showRegisterModal() {
    document.getElementById('registerModalOverlay').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.getElementById('registerError').textContent = '';
    document.getElementById('registerForm').reset();
}

function hideRegisterModal() {
    document.getElementById('registerModalOverlay').style.display = 'none';
    document.body.style.overflow = '';
}

function showAuthModal() {
    document.getElementById('authModalOverlay').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.getElementById('authError').textContent = '';
    document.getElementById('authForm').reset();
}

function hideAuthModal() {
    document.getElementById('authModalOverlay').style.display = 'none';
    document.body.style.overflow = '';
}

// --- SINGLE DOMContentLoaded LISTENER FOR ALL LOGIC ---
document.addEventListener('DOMContentLoaded', function () {
    // --- Registration Modal Logic (on both index.html and blog.html) ---
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', showRegisterModal);
    }
    const registerCancelBtn = document.getElementById('registerCancelBtn');
    if (registerCancelBtn) {
        registerCancelBtn.addEventListener('click', hideRegisterModal);
    }
    const openRegisterFromAuth = document.getElementById('openRegisterFromAuth');
    if (openRegisterFromAuth) {
        openRegisterFromAuth.addEventListener('click', function (e) {
            e.preventDefault();
            hideAuthModal();
            showRegisterModal();
        });
    }
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('registerName').value.trim();
            const role = document.getElementById('registerRole').value;
            const pw = document.getElementById('registerPassword').value;
            const pw2 = document.getElementById('registerPassword2').value;
            const errorDiv = document.getElementById('registerError');
            errorDiv.textContent = '';
            if (!name) {
                errorDiv.textContent = 'Please enter your first name.';
                return;
            }
            if (pw.length < 4) {
                errorDiv.textContent = 'Password must be at least 4 characters.';
                return;
            }
            if (pw !== pw2) {
                errorDiv.textContent = 'Passwords do not match.';
                return;
            }
            let users = getUsersFromStorage();
            const nameKey = name.toLowerCase();
            if (users[nameKey]) {
                errorDiv.textContent = 'User already exists. Please login.';
                return;
            }
            users[nameKey] = {
                displayName: name,
                role: role,
                password: hashPassword(pw)
            };
            saveUsersToStorage(users);
            hideRegisterModal();
            alert('Registration successful! Please login.');
            showAuthModal();
        });
    }

    // --- AUTH MODAL HANDLING (for blog.html) ---
    const authForm = document.getElementById('authForm');
    if (authForm) {
        let currentUser = localStorage.getItem('blogHubUser');
        let currentRole = localStorage.getItem('blogHubRole');
        if (!currentUser || !currentRole) {
            showAuthModal();
        }
        authForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('authName').value.trim();
            const role = document.getElementById('authRole').value;
            const pw = document.getElementById('authPassword').value;
            const errorDiv = document.getElementById('authError');
            errorDiv.textContent = '';
            if (!name) {
                errorDiv.textContent = 'Please enter your first name.';
                return;
            }
            let users = getUsersFromStorage();
            const nameKey = name.toLowerCase();
            if (!users[nameKey]) {
                errorDiv.textContent = 'User not found. Please register.';
                return;
            }
            if (users[nameKey].role !== role) {
                errorDiv.textContent = 'Role does not match registration.';
                return;
            }
            if (users[nameKey].password !== hashPassword(pw)) {
                errorDiv.textContent = 'Incorrect password.';
                return;
            }
            localStorage.setItem('blogHubUser', nameKey);
            localStorage.setItem('blogHubRole', role);
            localStorage.setItem('blogHubDisplayName', users[nameKey].displayName);
            hideAuthModal();
            window.location.reload();
        });
    }

    // Log Out button logic (for blog.html)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            localStorage.removeItem('blogHubUser');
            localStorage.removeItem('blogHubRole');
            localStorage.removeItem('blogHubDisplayName');
            window.location.reload();
        });
    }

    // --- BLOG PAGE LOGIC (with localStorage for posts/comments) ---
    if (document.getElementById('addPostForm')) {
        // Set the current date in the date field on page load and restrict to today only
        const today = new Date().toISOString().split('T')[0];
        const postDate = document.getElementById('postDate');
        if (postDate) {
            postDate.value = today;
            postDate.setAttribute('min', today);
            postDate.setAttribute('max', today);
        }

        // Pre-fill author field with current user
        const currentUser = localStorage.getItem('blogHubUser');
        const displayName = localStorage.getItem('blogHubDisplayName');
        const postAuthorInput = document.getElementById('postAuthor');
        if (postAuthorInput && displayName) {
            postAuthorInput.value = displayName;
            postAuthorInput.readOnly = true;
        }

        // --- Local Storage Blog Data ---
        function getBlogData() {
            return JSON.parse(localStorage.getItem('blogHubPosts') || '[]');
        }
        function saveBlogData(posts) {
            localStorage.setItem('blogHubPosts', JSON.stringify(posts));
        }

        // Render all blog posts from storage
        function renderBlogPosts() {
            const blogPostsDiv = document.getElementById('blogPosts');
            blogPostsDiv.innerHTML = '';
            blogPostRefs = [];
            let posts = getBlogData();
            posts.forEach(post => {
                const postDiv = createBlogPostDiv(post);
                blogPostsDiv.appendChild(postDiv);
                blogPostRefs.push({
                    id: post.id,
                    title: post.topic,
                    element: postDiv
                });
            });
            updateScrollToTopButton();
        }

        // Store blog post references for search
        let blogPostRefs = [];

        // Add a new blog post
        document.getElementById('addPostForm').addEventListener('submit', function (event) {
            event.preventDefault();

            document.getElementById('postAlert').innerHTML = '';

            const postTopic = document.getElementById('postTopic').value;
            const postAuthor = document.getElementById('postAuthor').value;
            const postDate = document.getElementById('postDate').value;
            const postContent = document.getElementById('postContent').value;
            const postConfirm = document.getElementById('postConfirm').checked;

            if (!postTopic.trim()) {
                document.getElementById('postTopic').focus();
                return;
            }
            if (!postAuthor.trim()) {
                document.getElementById('postAuthor').focus();
                return;
            }
            if (!postDate) {
                alert('The date is required. Please select a date.');
                document.getElementById('postDate').focus();
                return;
            }
            if (postDate !== today) {
                alert('The date must be today.');
                document.getElementById('postDate').focus();
                return;
            }
            if (!postContent.trim()) {
                document.getElementById('postContent').focus();
                return;
            }
            if (!postConfirm) {
                document.getElementById('postAlert').innerHTML = `
                    <span class="inline-alert">
                        <input type="checkbox" id="postConfirmInline" onclick="document.getElementById('postConfirm').checked=this.checked;document.getElementById('postAlert').innerHTML='';" style="margin-right:0.5rem;">
                        Please confirm you have checked your blog for accuracy, grammar, and spelling.
                    </span>
                `;
                document.getElementById('postConfirmInline').focus();
                return;
            }

            // Save to localStorage
            let posts = getBlogData();
            const postId = 'blog-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
            const authorKey = currentUser ? currentUser : postAuthor.trim().toLowerCase();
            const authorDisplay = displayName ? displayName : postAuthor.trim();
            const newPost = {
                id: postId,
                topic: postTopic,
                author: authorKey,
                authorDisplay: authorDisplay,
                date: postDate,
                content: postContent,
                emojis: { '👍': 0, '❤️': 0, '😂': 0, '😮': 0, '😢': 0 },
                comments: []
            };
            posts.push(newPost);
            saveBlogData(posts);

            renderBlogPosts();

            // Clear input fields
            document.getElementById('postTopic').value = '';
            document.getElementById('postContent').value = '';
            document.getElementById('postConfirm').checked = false;
            document.getElementById('postDate').value = today;
        });

        // Create blog post DOM element from post object
        function createBlogPostDiv(post) {
            const postDiv = document.createElement('div');
            postDiv.className = 'blog-post';
            postDiv.setAttribute('data-author', post.author);
            postDiv.id = post.id;

            const postTitle = document.createElement('h3');
            postTitle.textContent = `${post.topic} - by ${post.authorDisplay || post.author} on ${post.date}`;
            postDiv.appendChild(postTitle);

            const postText = document.createElement('p');
            postText.textContent = post.content;
            postText.className = 'post-content';
            postDiv.appendChild(postText);

            // Emoji container
            const emojiContainer = document.createElement('div');
            emojiContainer.className = 'emoji-container';
            emojiContainer.innerHTML = `
                <button type="button" onclick="incrementEmoji(this, '👍', '${post.id}')">👍 <span class="emoji-count">${post.emojis['👍']}</span></button>
                <button type="button" onclick="incrementEmoji(this, '❤️', '${post.id}')">❤️ <span class="emoji-count">${post.emojis['❤️']}</span></button>
                <button type="button" onclick="incrementEmoji(this, '😂', '${post.id}')">😂 <span class="emoji-count">${post.emojis['😂']}</span></button>
                <button type="button" onclick="incrementEmoji(this, '😮', '${post.id}')">😮 <span class="emoji-count">${post.emojis['😮']}</span></button>
                <button type="button" onclick="incrementEmoji(this, '😢', '${post.id}')">😢 <span class="emoji-count">${post.emojis['😢']}</span></button>
            `;
            postDiv.appendChild(emojiContainer);

            // Discuss section
            const discussSection = document.createElement('div');
            discussSection.className = 'discuss-section dynamic-modal-anchor';
            discussSection.innerHTML = `
                <h4>Discuss:</h4>
                <div class="comments"></div>
                <div class="comment-row">
                    <input type="text" class="comment-author" placeholder="Your First Name" required>
                    <input type="date" class="comment-date" required>
                </div>
                <textarea class="comment-input" placeholder="Write your comment here..." required></textarea>
                <div style="margin-bottom: 1rem;">
                    <input type="checkbox" class="comment-confirm" required>
                    <label>I've checked my comment for accuracy, grammar, and spelling.</label>
                </div>
                <div class="commentAlert"></div>
                <button class="comment-button" type="button">Comment</button>
            `;
            postDiv.appendChild(discussSection);

            // Set the current date for the comment date field and restrict to today only
            const commentDateField = discussSection.querySelector('.comment-date');
            commentDateField.value = today;
            commentDateField.setAttribute('min', today);
            commentDateField.setAttribute('max', today);

            // Render comments from storage
            const commentsDiv = discussSection.querySelector('.comments');
            post.comments.forEach(comment => {
                commentsDiv.appendChild(createCommentDiv(comment, post.id));
            });

            // Comment button logic
            discussSection.querySelector('.comment-button').addEventListener('click', function (e) {
                addComment(e, this, postDiv);
            });

            // Only show delete button if current user is author or admin
            const currentUserKey = localStorage.getItem('blogHubUser');
            const currentRole = localStorage.getItem('blogHubRole');
            if (
                (currentUserKey && currentUserKey === post.author) ||
                currentRole === 'admin'
            ) {
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.className = 'delete-btn';
                deleteButton.onclick = () => {
                    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
                        let posts = getBlogData();
                        posts = posts.filter(p => p.id !== post.id);
                        saveBlogData(posts);
                        renderBlogPosts();
                    }
                };
                postDiv.appendChild(deleteButton);
            }

            return postDiv;
        }

        // Add a comment to the discuss section and localStorage
        function addComment(event, button, postDiv) {
            if (event) event.preventDefault();

            const parent = button.parentElement;
            const commentAuthorInput = parent.querySelector('.comment-author');
            const commentAuthor = commentAuthorInput.value.trim();
            const commentDateInput = parent.querySelector('.comment-date');
            const commentDate = commentDateInput.value;
            const commentInput = parent.querySelector('.comment-input');
            const commentText = commentInput.value.trim();
            const commentConfirm = parent.querySelector('.comment-confirm').checked;
            const commentAlertDiv = parent.querySelector('.commentAlert');
            commentAlertDiv.innerHTML = '';

            const today = new Date().toISOString().split('T')[0];

            if (!commentAuthor) {
                commentAuthorInput.focus();
                return;
            }
            if (!commentDate) {
                commentDateInput.focus();
                commentAlertDiv.innerHTML = `
                    <span class="inline-alert">
                        Please select a date for your comment.
                    </span>
                `;
                return;
            }
            if (commentDate !== today) {
                commentDateInput.focus();
                commentAlertDiv.innerHTML = `
                    <span class="inline-alert">
                        The comment date must be today.
                    </span>
                `;
                return;
            }
            if (!commentText) {
                commentInput.focus();
                return;
            }
            if (!commentConfirm) {
                commentAlertDiv.innerHTML = `
                    <span class="inline-alert">
                        <input type="checkbox" class="comment-confirm-inline" onclick="this.closest('div').parentElement.querySelector('.comment-confirm').checked=this.checked;this.closest('.inline-alert').remove();" style="margin-right:0.5rem;">
                        Please confirm you have checked your comment for accuracy, grammar, and spelling.
                    </span>
                `;
                parent.querySelector('.comment-confirm-inline').focus();
                return;
            }

            // Save comment to localStorage
            let posts = getBlogData();
            let post = posts.find(p => p.id === postDiv.id);
            if (!post) return;
            const commentObj = {
                id: 'comment-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
                author: localStorage.getItem('blogHubUser') || commentAuthor.trim().toLowerCase(),
                authorDisplay: localStorage.getItem('blogHubDisplayName') || commentAuthor.trim(),
                date: commentDate,
                text: commentText
            };
            post.comments.push(commentObj);
            saveBlogData(posts);

            // Render comment
            const commentsDiv = parent.querySelector('.comments');
            commentsDiv.appendChild(createCommentDiv(commentObj, postDiv.id));

            // Clear comment fields
            commentAuthorInput.value = '';
            commentInput.value = '';
            parent.querySelector('.comment-confirm').checked = false;
            commentDateInput.value = today;
        }

        // Create comment DOM element from comment object
        function createCommentDiv(comment, postId) {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment';
            commentDiv.setAttribute('data-author', comment.author);

            const commentContent = document.createElement('span');
            commentContent.innerHTML = `<strong>${comment.authorDisplay || comment.author}</strong> on ${comment.date}:<br>${comment.text}`;
            commentContent.className = 'comment-content';
            commentDiv.appendChild(commentContent);

            // Only show delete button if current user is comment author or admin
            const currentUserKey = localStorage.getItem('blogHubUser');
            const currentRole = localStorage.getItem('blogHubRole');
            if (
                (currentUserKey && currentUserKey === comment.author) ||
                currentRole === 'admin'
            ) {
                const deleteCommentBtn = document.createElement('button');
                deleteCommentBtn.textContent = 'Delete';
                deleteCommentBtn.className = 'delete-btn';
                deleteCommentBtn.style.marginLeft = '1rem';
                deleteCommentBtn.onclick = () => {
                    if (confirm('Are you sure you want to delete this comment?')) {
                        let posts = getBlogData();
                        let post = posts.find(p => p.id === postId);
                        if (post) {
                            post.comments = post.comments.filter(c => c.id !== comment.id);
                            saveBlogData(posts);
                            renderBlogPosts();
                        }
                    }
                };
                commentDiv.appendChild(deleteCommentBtn);
            }

            return commentDiv;
        }

        // Increment emoji count (with localStorage)
        window.incrementEmoji = function (button, emoji, postId) {
            let posts = getBlogData();
            let post = posts.find(p => p.id === postId);
            if (post) {
                post.emojis[emoji] = (post.emojis[emoji] || 0) + 1;
                saveBlogData(posts);
                renderBlogPosts();
            }
        };

        // Blog search functionality
        window.searchBlogs = function () {
            const keyword = document.getElementById('searchInput').value.trim().toLowerCase();
            document.getElementById('searchInput').value = ''; // Clear search box after search
            if (!keyword) {
                showModal([], true);
                return;
            }
            // Find all blog posts with matching title (case-insensitive, all topics)
            const matches = blogPostRefs.filter(ref => ref.title.toLowerCase().includes(keyword));
            showModal(matches, false);
        };

        // Modal navigation state
        let modalMatches = [];
        let modalCurrentIndex = 0;

        // Robust modal logic
        function showModal(matches, emptySearch) {
            const overlay = document.getElementById('searchModalOverlay');
            const modal = document.getElementById('searchModal');
            modalMatches = matches;
            modalCurrentIndex = 0;

            // Remove any previous dynamic modals
            document.querySelectorAll('.dynamic-modal-below').forEach(el => el.remove());

            overlay.style.display = 'flex';

            if (emptySearch) {
                modal.innerHTML = `
                    <h3>Blog Search Results</h3>
                    <div class="modal-instruction">Please enter a keyword to search blog titles.</div>
                    <button class="modal-close" onclick="closeModal()">Close</button>
                `;
                modal.focus();
                return;
            }

            if (matches.length === 0) {
                modal.innerHTML = `
                    <h3>Blog Search Results</h3>
                    <div class="modal-instruction">No blogs found for your search.</div>
                    <button class="modal-close" onclick="closeModal()">Close</button>
                `;
                modal.focus();
                return;
            }

            // Build modal content for multiple results
            let html = `<h3>Blog Search Results</h3>
                <div class="modal-instruction">Select blog(s) to view. Close this window when no longer required.</div>
                <form class="modal-list">`;
            matches.forEach((ref, idx) => {
                html += `<label><input type="checkbox" class="modal-blog-check" value="${ref.id}"> ${ref.title}</label>`;
            });
            html += `</form>
                <button onclick="goToCheckedBlogs(event)" style="margin-bottom:1rem;background:#007bff;color:#fff;border:none;padding:0.5rem 1rem;border-radius:5px;cursor:pointer;">Go to Selected Blogs</button>
                <button class="modal-close" onclick="closeModal()">Close</button>
            `;
            modal.innerHTML = html;
            modal.focus();
        }

        window.closeModal = function () {
            document.getElementById('searchModalOverlay').style.display = 'none';
            document.querySelectorAll('.dynamic-modal-below').forEach(el => el.remove());
        };

        window.goToCheckedBlogs = function (event) {
            if (event) event.preventDefault();
            // Get all checked blogs
            const checks = document.querySelectorAll('.modal-blog-check:checked');
            if (checks.length === 0) {
                alert('Please select at least one blog to view.');
                return;
            }
            // Build an array of blog ids in order
            const blogIds = Array.from(checks).map(input => input.value);
            // Start navigation
            closeModal();
            navigateBlogs(blogIds, 0);
        };

        // Insert the modal ABOVE the blog post being viewed
        window.navigateBlogs = function (blogIds, idx) {
            if (idx >= blogIds.length) {
                closeModal();
                return;
            }
            // Remove any previous modal
            document.querySelectorAll('.dynamic-modal-below').forEach(el => el.remove());
            // Scroll to blog
            const blog = document.getElementById(blogIds[idx]);
            if (blog) {
                blog.scrollIntoView({ behavior: 'smooth', block: 'center' });
                blog.style.boxShadow = '0 0 0 3px #007bff';
                setTimeout(() => blog.style.boxShadow = '', 2000);

                // Show modal above this blog
                const dynamicDiv = document.createElement('div');
                dynamicDiv.className = 'dynamic-modal-below';
                dynamicDiv.innerHTML = `
                    <div class="modal" tabindex="1" style="z-index:3001;">
                        <h3>Viewing Blog: ${blog.querySelector('h3').textContent}</h3>
                        <div class="modal-instruction">Continue to next blog or close this window when no longer required.</div>
                        <button onclick="navigateBlogs(['${blogIds.join("','")}'], ${idx + 1})" style="margin-bottom:1rem;background:#007bff;color:#fff;border:none;padding:0.5rem 1rem;border-radius:5px;cursor:pointer;" ${idx + 1 >= blogIds.length ? 'disabled' : ''}>Continue to Next Blog</button>
                        <button class="modal-close" onclick="closeModal()">Close</button>
                    </div>
                `;
                // Insert the modal above the blog post
                blog.parentNode.insertBefore(dynamicDiv, blog);
                // Focus the modal for accessibility
                setTimeout(() => {
                    const modalEl = dynamicDiv.querySelector('.modal');
                    if (modalEl) modalEl.focus();
                }, 0);
            }
        };

        // Close modal when clicking outside modal content
        document.getElementById('searchModalOverlay').addEventListener('click', function (e) {
            if (e.target === this) closeModal();
        });

        // Scroll to the top of the page
        window.scrollToTop = function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        // Show or hide the "Return to Top" button
        function updateScrollToTopButton() {
            const scrollToTopButton = document.getElementById('scrollToTop');
            const blogPostsDiv = document.getElementById('blogPosts');
            if (scrollToTopButton && blogPostsDiv) {
                const posts = blogPostsDiv.querySelectorAll('.blog-post');
                // Show button only if there is at least one post and the user has scrolled down 200px
                if (posts.length > 0 && window.scrollY > 200) {
                    scrollToTopButton.style.display = 'block';
                } else {
                    scrollToTopButton.style.display = 'none';
                }
            }
        }

        // Ensure the button is correct on page load
        updateScrollToTopButton();

        // Update button on scroll
        window.addEventListener('scroll', updateScrollToTopButton);

        // Allow Enter to submit the blog post form from any input (except textarea)
        document.getElementById('addPostForm').addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                this.requestSubmit();
            }
        });

        // Add event delegation for comment submission via Enter key
        document.addEventListener('keydown', function (e) {
            // Only trigger on Enter key, not Shift+Enter (for newlines in textarea)
            if (e.key === 'Enter' && !e.shiftKey) {
                // If focus is on a comment textarea, submit comment
                const active = document.activeElement;
                if (active && active.classList.contains('comment-input')) {
                    e.preventDefault();
                    // Find the related comment button and trigger click
                    const discussSection = active.closest('.discuss-section');
                    if (discussSection) {
                        const commentBtn = discussSection.querySelector('.comment-button');
                        if (commentBtn) commentBtn.click();
                    }
                }
            }
        });

        // Initial render
        renderBlogPosts();
    }

    // --- Contact form handling for index.html ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            // Optionally validate email/message here
            // Redirect to success.html with name as query param
            window.location.href = `success.html?name=${encodeURIComponent(name)}`;
        });
    }

    // --- Shared navigation and theme toggle logic for all pages ---
    var themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
        themeBtn.addEventListener('click', function () {
            document.body.classList.toggle('dark-mode');
        });
    }
    var burger = document.getElementById('burgerMenu');
    var navLinks = document.getElementById('navLinks');
    if (burger && navLinks) {
        burger.addEventListener('click', function () {
            navLinks.classList.toggle('active');
        });
    }
});
