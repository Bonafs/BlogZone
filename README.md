# BlogZone

BlogZone is a modern, responsive blogging platform built with vanilla JavaScript, HTML5, and CSS3. It enables users to register, log in, create and interact with blog posts, comment, react with emojis, and search for content—all in a seamless, single-page experience. All data is stored in the browser using localStorage, making it easy to try out and deploy without a backend.

---

## 🚀 Features

### User Management

- **Registration & Login:**  
  Users can register with a name, password, and role (User or Admin). Login is required to access blog features.
- **Role-based Access:**  
  Admins can delete any post or comment; users can delete their own.
- **Persistent Sessions:**  
  User sessions are stored in localStorage for convenience.

### Blogging

- **Create Posts:**  
  Authenticated users can create blog posts with a title, content, and date (restricted to today).
- **Delete Posts:**  
  Authors and admins can delete posts with confirmation prompts.
- **Emoji Reactions:**  
  Readers can react to posts with emojis (👍 ❤️ 😂 😮 😢), and counts are updated live.

### Comments

- **Add Comments:**  
  Users can comment on posts, with author name and date (restricted to today).
- **Delete Comments:**  
  Authors and admins can delete comments with confirmation.

### Search & Navigation

- **Dynamic Search Modal:**  
  Search blog posts by title using a modal dialog. Results are selectable, and users can jump directly to posts.
- **Modal Navigation:**  
  Navigate through multiple search results with a floating modal above each post.

### UI & UX

- **Responsive Design:**  
  Works on all devices, with a mobile-friendly layout.
- **Dark Mode:**  
  Toggle dark mode for comfortable reading.
- **Burger Menu:**  
  Responsive navigation for mobile screens.
- **Accessibility:**  
  Keyboard navigation and focus management in modals.

### Contact & About

- **Contact Form:**  
  Users can send a message via the contact form (redirects to a success page).
- **About Section:**  
  Learn more about BlogSphere and its features.

### Data Storage

- **LocalStorage:**  
  All user, post, comment, and session data is stored in the browser. No backend required.

---

## 🛠️ Technologies Used

- **HTML5** — Semantic markup for structure and accessibility.
- **CSS3** — Responsive, modern styling with dark mode support.
- **JavaScript (ES6+)** — All interactivity, authentication, and data management.
- **localStorage** — Persistent data storage in the browser.
- **No frameworks or libraries** — 100% vanilla JS, CSS, and HTML.

---

## 📂 Project Structure

```
blogSphere/
│
├── index.html           # Home page (about, contact, registration)
├── blog.html            # Main blog interface
├── success.html         # Contact form success page
│
├── static/
│   ├── css/
│   │   └── style.css    # All styles
│   └── script.js        # All JavaScript logic
│
└── README.md            # This file
```

---

## 📝 Usage

1. **Clone or Download the Repository**
2. **Open `index.html` in your browser**
3. **Register a new user or admin account**
4. **Navigate to the Blog page**
5. **Create, search, comment, and interact with posts!**

---

## 🔑 Key Code Features

### Registration & Login

```js
// Registration
users[nameKey] = {
    displayName: name,
    role: role,
    password: hashPassword(pw)
};
saveUsersToStorage(users);

// Login
if (users[nameKey].password === hashPassword(pw)) {
    localStorage.setItem('blogHubUser', nameKey);
    localStorage.setItem('blogHubRole', role);
    localStorage.setItem('blogHubDisplayName', users[nameKey].displayName);
}
```

### Blog Post Creation

```js
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
```

### Emoji Reactions

```js
window.incrementEmoji = function (button, emoji, postId) {
    let posts = getBlogData();
    let post = posts.find(p => p.id === postId);
    if (post) {
        post.emojis[emoji] = (post.emojis[emoji] || 0) + 1;
        saveBlogData(posts);
        renderBlogPosts();
    }
};
```

### Search Modal

```js
window.searchBlogs = function () {
    const keyword = document.getElementById('searchInput').value.trim().toLowerCase();
    // ...
    const matches = blogPostRefs.filter(ref => ref.title.toLowerCase().includes(keyword));
    showModal(matches, false);
};
```

---

## 🖼️ Screenshots

- **Home Page:**  
  ![Home Page Screenshot](#)
- **Blog Page:**  
  ![Blog Page Screenshot](#)
- **Search Modal:**  
  ![Search Modal Screenshot](#)

---

## 🛡️ Security & Privacy

- All data is stored locally in your browser.
- Passwords are hashed (simple hash, not for production).
- No data is sent to any server.

---

## 📄 License

Copyright Mobolaji Onafuwa  
Fullstack Ai-Augmented Developer 2025.