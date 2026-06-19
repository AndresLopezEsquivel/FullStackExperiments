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
