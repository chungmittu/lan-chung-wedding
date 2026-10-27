let currentSlideIndex = 0;
let autoSlideInterval = null;

// Lấy số lượng thẻ hiển thị dựa theo kích thước màn hình
function getItemsPerPage() {
  if (window.innerWidth <= 640) return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3; // Mặc định hiển thị 3 lời chúc trên máy tính
}

function updateWishSlider() {
  const wishList = document.getElementById('wishList');
  if (!wishList) return;

  const wishes = Array.from(wishList.querySelectorAll('.wish'));
  if (wishes.length === 0) return;

  const itemsPerPage = getItemsPerPage();
  const totalPages = Math.ceil(wishes.length / itemsPerPage);

  // Đảm bảo chỉ số trang hợp lệ
  if (currentSlideIndex >= totalPages) currentSlideIndex = 0;
  if (currentSlideIndex < 0) currentSlideIndex = totalPages - 1;

  // Hiển thị/ẩn các lời chúc tương ứng với trang hiện tại
  const startIndex = currentSlideIndex * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  wishes.forEach((wish, index) => {
    if (index >= startIndex && index < endIndex) {
      wish.style.display = 'flex';
      wish.classList.add('is-active');
    } else {
      wish.style.display = 'none';
      wish.classList.remove('is-active');
    }
  });

  // Cập nhật bộ đếm trang (ví dụ: 1 / 3)
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

// Khởi tạo slider
function initWishSlider() {
  const wishList = document.getElementById('wishList');
  if (!wishList) return;

  wishList.classList.add('wish-slider');
  updateWishSlider();
  startAutoWishSlide();

  // Nút chuyển slide
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

  // Rê chuột vào thì tạm dừng tự động chạy
  wishList.addEventListener('mouseenter', stopAutoWishSlide);
  wishList.addEventListener('mouseleave', startAutoWishSlide);
}

// Lắng nghe thay đổi kích thước màn hình
window.addEventListener('resize', updateWishSlider);

// Khởi tạo slider khi tải xong trang
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initWishSlider, 300);
});
