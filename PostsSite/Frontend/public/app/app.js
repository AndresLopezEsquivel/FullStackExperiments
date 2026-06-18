const resizeBtn = document.querySelector('.card-resize');
const card = document.querySelector('.card');

resizeBtn.addEventListener('click', e => {
  const cardIsExpanded = card.classList.toggle('expanded');
  resizeBtn.textContent = cardIsExpanded ? "Show Less" : "Show More";
});
