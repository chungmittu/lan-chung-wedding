'use strict';

// ==========================================
// 1. CÁC HÀM TIỆN ÍCH DÙNG CHUNG (HELPERS)
// ==========================================
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// Hiển thị thông báo dạng Toast (nổi lên rồi ẩn đi)
const notify = message => {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
};

// ==========================================
// 2. XỬ LÝ GIAO DIỆN & MENU DI ĐỘNG
// ==========================================
// Mở thiệp từ màn hình cover
if ($('#open')) {
  $('#open').onclick = () => {
    $('#cover').classList.add('open');
    document.body.classList.remove('locked');
    setTimeout(() => $('#cover').remove(), 700);
  };
}

// Bật/tắt menu trên mobile
if ($('#menu')) {
  $('#menu').onclick = event => {
    const isOpen = $('#nav').classList.toggle('open');
    event.currentTarget.setAttribute('aria-expanded', isOpen);
  };
}

// Click chọn menu sẽ tự đóng menu mobile lại
$$('nav a').forEach(link => {
  link.onclick = () => $('#nav').classList.remove('open');
});

// Hiệu ứng cuộn trang hiện dần (Scroll Reveal)
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

$$('.reveal').forEach(element => observer.observe(element));

// ==========================================
// 3. BỘ ĐẾM NGƯỢC THỜI GIAN (COUNTDOWN)
// ==========================================
const targetTime = new Date('2026-12-12T10:30:00+07:00').getTime();

function updateCountdown() {
  const now = Date.now();
  const timeLeft = targetTime - now;

  if (timeLeft <= 0) {
    ['days', 'hours', 'mins', 'secs'].forEach(id => {
      if ($('#' + id)) $('#' + id).textContent = '00';
    });
    if ($('#countMsg')) $('#countMsg').textContent = 'Ngày hạnh phúc đã đến!';
    return;
  }

  if ($('#days')) $('#days').textContent = String(Math.floor(timeLeft / 864e5));
  if ($('#hours')) $('#hours').textContent = String(Math.floor((timeLeft % 864e5) / 36e5)).padStart(2, '0');
  if ($('#mins')) $('#mins').textContent = String(Math.floor((timeLeft % 36e5) / 6e4)).padStart(2, '0');
  if ($('#secs')) $('#secs').textContent = String(Math.floor((timeLeft % 6e4) / 1e3)).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ==========================================
// 4. LỊCH THÁNG & TẠO SỰ KIỆN LỊCH (ICS)
// ==========================================
// Render lịch tháng 12/2026 (Ngày 12 được đánh dấu class 'today')
if ($('#cal')) {
  const daysHTML = '<span class="muted">30</span>' + 
    Array.from({ length: 31 }, (_, i) => `<span class="${i === 11 ? 'today' : ''}">${i + 1}</span>`).join('') + 
    '<span class="muted">1</span><span class="muted">2</span><span class="muted">3</span>';
  $('#cal').innerHTML = daysHTML;
}

// Dữ liệu tạo file lịch cá nhân (.ics)
const calendarEvents = {
  bride: ['Tiệc nhà gái - Lan & Chung', '20261212T033000Z', '20261212T053000Z', 'SeaBay Hạ Long, X232+7MW, Bãi Cháy, Quảng Ninh'],
  groom: ['Tiệc nhà trai - Lan & Chung', '20261212T100000Z', '20261212T120000Z', 'Số 8, ngõ 3, đường Văn Hoá, Khối 8, Sóc Sơn, Hà Nội']
};

$$('[data-ics]').forEach(button => {
  button.onclick = () => {
    const ev = calendarEvents[button.dataset.ics];
    const blobContent = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nDTSTART:${ev[1]}\r\nDTEND:${ev[2]}\r\nSUMMARY:${ev[0]}\r\nLOCATION:${ev[3]}\r\nEND:VEVENT\r\nEND:VCALENDAR`;
    
    const blob = new Blob([blobContent], { type: 'text/calendar' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `lan-chung-${button.dataset.ics}.ics`;
    downloadLink.click();
  };
});

// ==========================================
// 5. CÁC TƯƠNG TÁC TIỆN ÍCH (COPY, MAPS, SHARE)
// ==========================================
// Sao chép địa chỉ khi bấm nút
$$('[data-copy]').forEach(button => {
  button.onclick = () => {
    navigator.clipboard.writeText(button.dataset.copy)
      .then(() => notify('Đã sao chép địa chỉ'))
      .catch(() => notify('Không thể sao chép'));
  };
});

// Nút chọn sự kiện ở phần địa điểm để cuộn thẳng xuống form RSVP
$$('[data-select]').forEach(button => {
  button.onclick = () => {
    $('[name=event]').value = button.dataset.select;
    $('#rsvp').scrollIntoView({ behavior: 'smooth' });
  };
});

// Nút chia sẻ trang thiệp cưới
if ($('#share')) {
  $('#share').onclick = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Lan & Chung | 12.12.2026', url: location.href });
      } else {
        await navigator.clipboard.writeText(location.href);
      }
      notify('Đã sẵn sàng chia sẻ');
    } catch (e) {
      // Người dùng hủy chia sẻ
    }
  };
}

// ==========================================
// 6. ALBUM ẢNH (LIGHTBOX PHÓNG TO)
// ==========================================
$$('.photo').forEach(photoBtn => {
  photoBtn.onclick = () => {
    $('#lightImg').src = photoBtn.dataset.img;
    $('#lightImg').alt = $('img', photoBtn).alt;
    $('#lightbox').hidden = false;
  };
});

$('#close').onclick = () => $('#lightbox').hidden = true;

$('#lightbox').onclick = event => {
  if (event.target === $('#lightbox')) $('#lightbox').hidden = true;
};

document.onkeydown = event => {
  if (event.key === 'Escape') $('#lightbox').hidden = true;
};

// ==========================================
// 7. BACKEND GOOGLE SHEETS: RSVP + LỜI CHÚC
// ==========================================
const CONFIG = window.WEDDING_CONFIG || {};
function createSubmissionId(){const random=crypto.getRandomValues(new Uint32Array(1))[0].toString(36);return `lc_${Date.now().toString(36)}_${random}`}
function jsonp(params,timeout=10000){return new Promise((resolve,reject)=>{if(!CONFIG.apiUrl)return reject(new Error('Backend Google Sheets chưa được cấu hình'));const callback=`lc_callback_${Date.now()}_${Math.random().toString(36).slice(2)}`;const script=document.createElement('script');const timer=setTimeout(()=>finish(new Error('Hết thời gian chờ Google Sheets')),timeout);function finish(error,data){clearTimeout(timer);delete window[callback];script.remove();error?reject(error):resolve(data)}window[callback]=data=>finish(null,data);script.onerror=()=>finish(new Error('Không kết nối được Google Sheets'));script.src=`${CONFIG.apiUrl}?${new URLSearchParams({...params,callback})}`;document.head.appendChild(script)})}
async function submitAndVerify(payload){if(!CONFIG.apiUrl)throw new Error('Backend Google Sheets chưa được cấu hình');const id=createSubmissionId();await fetch(CONFIG.apiUrl,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({...payload,id})});for(let attempt=0;attempt<4;attempt++){await new Promise(resolve=>setTimeout(resolve,900+attempt*500));const result=await jsonp({action:'status',id});if(result.saved)return id}throw new Error('Đã gửi nhưng chưa xác minh được dữ liệu trong Google Sheets')}
async function checkBackend(){const state=$('#backendState');if(!state)return;if(!CONFIG.apiUrl){state.textContent='Backend Google Sheets chưa được kết nối.';return}try{const result=await jsonp({action:'health'});state.textContent=result.ok?'Google Sheets đã kết nối và sẵn sàng nhận phản hồi.':'Google Sheets chưa sẵn sàng.'}catch(error){state.textContent='Không kiểm tra được Google Sheets. Kiểm tra config.js và quyền Web App.'}}
function appendWish(wish,label='Đã duyệt'){const article=document.createElement('article');article.className='wish';const small=document.createElement('small');small.textContent=label;const quote=document.createElement('blockquote');quote.textContent=wish.wish;const author=document.createElement('p');author.textContent=wish.name;article.append(small,quote,author);$('#wishList').prepend(article)}
async function loadApprovedWishes(){if(!CONFIG.apiUrl)return;try{const result=await jsonp({action:'wishes'});(result.wishes||[]).reverse().forEach(wish=>appendWish(wish))}catch(error){console.warn('Không tải được lời chúc:',error)}}
checkBackend();loadApprovedWishes();
$('#wishForm').onsubmit=async event=>{event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;const data=Object.fromEntries(new FormData(form));const status=$('#wishStatus');const button=$('button',form);button.disabled=true;status.textContent='Đang gửi và xác minh...';try{await submitAndVerify({type:'wish',name:data.guestName.trim(),wish:data.wish.trim()});appendWish(
  {
    name: data.guestName.trim(),
    wish: data.wish.trim()
  },
  'Vừa gửi'
);

$('#wishList .wish')?.classList.add('is-new');

status.textContent =
  'Lời chúc đã được lưu và hiển thị trên trang.';form.reset()}catch(error){status.textContent=`${error.message}. Vui lòng thử lại.`}finally{button.disabled=false}};
// ==========================================
// 8. FORM XÁC NHẬN THAM DỰ (RSVP) & NHẠC
// ==========================================
$('#rsvpForm').onsubmit=async event=>{event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;const data=Object.fromEntries(new FormData(form));const status=$('#rsvpStatus');const button=$('button',form);button.disabled=true;status.textContent='Đang gửi và xác minh...';try{const id=await submitAndVerify({type:'rsvp',name:data.name.trim(),guests:data.guests,event:data.event,attendance:data.attendance,phone:data.phone||'',message:data.message||''});status.textContent=`Đã lưu xác nhận vào Google Sheets. Mã xác nhận: ${id}`;form.reset()}catch(error){status.textContent=`${error.message}. Vui lòng thử lại hoặc liên hệ trực tiếp.`}finally{button.disabled=false}};
if($('#music'))$('#music').onclick=()=>notify('Nhạc chưa được cấu hình.');

// ==========================================
// WISHES CAROUSEL SLIDER LOGIC
// ==========================================
let currentSlide = 0;
let slideInterval = null;

function initWishSlider() {
  const wishList = $('#wishList');
  if (!wishList) return;
  
  wishList.classList.add('wish-slider');
  updateSlides();
  startAutoSlide();

  // Gắn sự kiện nút bấm qua lại
  const prevBtn = $('#prevWish');
  const nextBtn = $('#nextWish');

  if (prevBtn) {
    prevBtn.onclick = () => {
      prevSlide();
      resetAutoSlide();
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      nextSlide();
      resetAutoSlide();
    };
  }

  // Tạm dừng tự động chuyển khi rê chuột vào khu vực slider hoặc nút bấm
  const controls = $('#wishSliderControls');
  [wishList, controls].forEach(el => {
    if (!el) return;
    el.addEventListener('mouseenter', stopAutoSlide);
    el.addEventListener('mouseleave', startAutoSlide);
  });
}

function getSlides() {
  return $$('.wish', $('#wishList'));
}

function updateSlides() {
  const slides = getSlides();
  if (slides.length === 0) return;

  if (currentSlide >= slides.length) currentSlide = 0;
  if (currentSlide < 0) currentSlide = slides.length - 1;

  slides.forEach((slide, idx) => {
    if (idx === currentSlide) {
      slide.classList.add('is-active');
    } else {
      slide.classList.remove('is-active');
    }
  });

  const counter = $('#wishCounter');
  if (counter) {
    counter.textContent = `${currentSlide + 1} / ${slides.length}`;
  }
}

function nextSlide() {
  const slides = getSlides();
  if (slides.length <= 1) return;
  currentSlide = (currentSlide + 1) % slides.length;
  updateSlides();
}

function prevSlide() {
  const slides = getSlides();
  if (slides.length <= 1) return;
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  updateSlides();
}

function startAutoSlide() {
  stopAutoSlide();
  slideInterval = setInterval(() => {
    nextSlide();
  }, 3000); // Tự động chuyển sau mỗi 3 giây
}

function stopAutoSlide() {
  if (slideInterval) {
    clearInterval(slideInterval);
    slideInterval = null;
  }
}

function resetAutoSlide() {
  stopAutoSlide();
  startAutoSlide();
}

// Gọi khởi tạo slider sau khi đã load xong lời chúc từ server hoặc localStorage
// Đặt lệnh này ở cuối file main.js hoặc sau hàm loadWishes / addWish
setTimeout(() => {
  initWishSlider();
}, 500);

// Khi có lời chúc mới thêm vào, cập nhật lại số lượng slide
const originalAddWish = window.addWish || function(){};
// Đảm bảo mỗi khi gọi addWish hoặc tải xong wishes, chạy lại updateSlides()
