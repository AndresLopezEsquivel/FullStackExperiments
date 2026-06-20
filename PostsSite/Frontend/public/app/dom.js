function createCard(post) {
  const card = document.createElement('div');
  card.className = 'card';

  const header = document.createElement('div');
  header.className = 'card-header';

  const avatar = document.createElement('div');
  avatar.className = 'card-header-avatar';

  const info = document.createElement('div');
  info.className = 'card-header-info';

  const title = document.createElement('p');
  title.textContent = post.title;

  const author = document.createElement('p');
  author.textContent = post.author;

  info.append(title, author);
  header.append(avatar, info);

  const content = document.createElement('div');
  content.className = 'card-content';
  content.textContent = post.content;

  const resize = document.createElement('div');
  resize.className = 'card-resize';
  resize.textContent = 'Show More';

  card.append(header, content, resize);
  return card;
}

// Renders posts into the .posts container, replacing any existing cards.
export function renderPosts(posts) {
  const postsContainer = document.querySelector('.posts');
  postsContainer.replaceChildren(...posts.map(createCard));
}

// Adds a single post to the top of the .posts container.
export function prependPost(post) {
  const postsContainer = document.querySelector('.posts');
  postsContainer.prepend(createCard(post));
}

// Wires the create-post form. `onSubmit` receives the form values and should
// resolve once the post is persisted; the form is reset afterward.
export function initPostForm(onSubmit) {
  const form = document.querySelector('.post-form');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    try {
      await onSubmit(data);
      form.reset();
    } catch (err) {
      console.error('Failed to publish post:', err);
    } finally {
      submitBtn.disabled = false;
    }
  });
}

export function initCardResize() {
  const postsContainer = document.querySelector('.posts');

  postsContainer.addEventListener('click', e => {
    const resizeBtn = e.target.closest('.card-resize');
    if(!resizeBtn) return;
    const card = resizeBtn.closest('.card');
    const cardIsExpanded = card.classList.toggle('expanded');
    resizeBtn.textContent = cardIsExpanded ? "Show Less" : "Show More";
  });
}
