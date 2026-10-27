let currentSlideIndex = 0;
let autoSlideInterval = null;

// Xác định số lượng lời chúc hiển thị trên 1 trang (Máy tính = 2, Điện thoại = 1)
function getItemsPerPage() {
  return window.innerWidth <= 768 ? 1 : 2;
}

function updateWishSlider() {
  const wishList = document.getElementById('wishList');
  if (!wishList) return;

  const wishes = Array.from(wishList.querySelectorAll('.wish'));
  if (wishes.length === 0) return;

  const itemsPerPage = getItemsPerPage();
  const totalPages = Math.ceil(wishes.length / itemsPerPage);

  if (currentSlideIndex >= totalPages) currentSlideIndex = 0;
  if (currentSlideIndex < 0) currentSlideIndex = totalPages - 1;

  const startIndex = currentSlideIndex * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  wishes.forEach((wish, index) => {
    if (index >= startIndex && index < endIndex) {
      wish.style.display = 'flex';
    } else {
      wish.style.display = 'none';
    }
  });

  const counter = document.getElementById('wishCounter');
  if (counter) {
    counter.textContent = `${currentSlideIndex + 1} / ${totalPages}`;
  }
}

function nextWishSlide() {
  currentSlideIndex++;
  updateWishSlider();
}

function prevWishSlide() {
  currentSlideIndex--;
  updateWishSlider();
}

function startAutoWishSlide() {
  stopAutoWishSlide();
  autoSlideInterval = setInterval(nextWishSlide, 3000); // Tự động chuyển sau 3 giây
}

function stopAutoWishSlide() {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
    autoSlideInterval = null;
  }
}

function initWishSlider() {
  const wishList = document.getElementById('wishList');
  if (!wishList) return;

  wishList.classList.add('wish-slider');
  updateWishSlider();
  startAutoWishSlide();

  const prevBtn = document.getElementById('prevWish');
  const nextBtn = document.getElementById('nextWish');

  if (prevBtn) {
    prevBtn.onclick = () => {
      prevWishSlide();
      startAutoWishSlide();
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      nextWishSlide();
      startAutoWishSlide();
    };
  }

  const wrapper = document.querySelector('.wish-slider-wrapper');
  if (wrapper) {
    wrapper.addEventListener('mouseenter', stopAutoWishSlide);
    wrapper.addEventListener('mouseleave', startAutoWishSlide);
  }
}

window.addEventListener('resize', updateWishSlider);

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initWishSlider, 300);
});
