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
