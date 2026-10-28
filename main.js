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
    startBackgroundMusic();
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
  link.onclick = () => {
    $('#nav').classList.remove('open');
    $('#menu')?.setAttribute('aria-expanded', 'false');
  };
});

// Hiệu ứng cuộn trang hiện dần (Scroll Reveal)
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08 }
);

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
      const element = $('#' + id);
      if (element) element.textContent = '00';
    });

    const message = $('#countMsg');
    if (message) message.textContent = 'Ngày hạnh phúc đã đến!';
    return;
  }

  const days = $('#days');
  const hours = $('#hours');
  const minutes = $('#mins');
  const seconds = $('#secs');

  if (days) days.textContent = String(Math.floor(timeLeft / 864e5));
  if (hours) {
    hours.textContent = String(Math.floor((timeLeft % 864e5) / 36e5)).padStart(2, '0');
  }
  if (minutes) {
    minutes.textContent = String(Math.floor((timeLeft % 36e5) / 6e4)).padStart(2, '0');
  }
  if (seconds) {
    seconds.textContent = String(Math.floor((timeLeft % 6e4) / 1e3)).padStart(2, '0');
  }
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ==========================================
// 4. LỊCH THÁNG & TẠO SỰ KIỆN LỊCH (ICS)
// ==========================================
// Render lịch tháng 12/2026 (Ngày 12 được đánh dấu class 'today')
if ($('#cal')) {
  const daysHTML =
    '<span class="muted">30</span>' +
    Array.from(
      { length: 31 },
      (_, i) => `<span class="${i === 11 ? 'today' : ''}">${i + 1}</span>`
    ).join('') +
    '<span class="muted">1</span><span class="muted">2</span><span class="muted">3</span>';
  $('#cal').innerHTML = daysHTML;
}

// Dữ liệu tạo file lịch cá nhân (.ics)
const calendarEvents = {
  bride: [
    'Tiệc nhà gái - Lan & Chung',
    '20261212T033000Z',
    '20261212T053000Z',
    'SeaBay Hạ Long, X232+7MW, Bãi Cháy, Quảng Ninh'
  ],
  groom: [
    'Tiệc nhà trai - Lan & Chung',
    '20261212T100000Z',
    '20261212T120000Z',
    'Số 8, ngõ 3, đường Văn Hoá, Khối 8, Sóc Sơn, Hà Nội'
  ]
};

$$('[data-ics]').forEach(button => {
  button.onclick = () => {
    const ev = calendarEvents[button.dataset.ics];
    const blobContent =
      `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\n` +
      `DTSTART:${ev[1]}\r\nDTEND:${ev[2]}\r\nSUMMARY:${ev[0]}\r\n` +
      `LOCATION:${ev[3]}\r\nEND:VEVENT\r\nEND:VCALENDAR`;

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
  button.onclick = async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      notify(button.dataset.copyMessage || 'Đã sao chép địa chỉ');
    } catch (error) {
      notify('Không thể sao chép. Hãy kiểm tra quyền clipboard của trình duyệt.');
    }
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
        await navigator.share({
          title: 'Lan & Chung | 12.12.2026',
          url: location.href
        });
      } else {
        await navigator.clipboard.writeText(location.href);
      }
      notify('Đã sẵn sàng chia sẻ');
    } catch (error) {
      if (error.name !== 'AbortError') {
        notify('Không thể chia sẻ trang thiệp.');
      }
    }
  };
}

// ==========================================
// 6. ALBUM ẢNH (LIGHTBOX PHÓNG TO)
// ==========================================
const lightbox = $('#lightbox');
let lightboxTrigger = null;

function closeLightbox() {
  if (!lightbox || lightbox.hidden) return;

  lightbox.hidden = true;
  document.body.classList.remove('lightbox-open');
  lightboxTrigger?.focus();
  lightboxTrigger = null;
}

$$('.photo').forEach(photoButton => {
  photoButton.onclick = () => {
    lightboxTrigger = photoButton;
    $('#lightImg').src = photoButton.dataset.img;
    $('#lightImg').alt = $('img', photoButton).alt;
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
    $('#close').focus();
  };
});

$('#close').onclick = closeLightbox;

lightbox.onclick = event => {
  if (event.target === lightbox) {
    closeLightbox();
  }
};

document.addEventListener('keydown', event => {
  if (lightbox?.hidden) return;

  if (event.key === 'Escape') {
    closeLightbox();
  } else if (event.key === 'Tab') {
    event.preventDefault();
    $('#close').focus();
  }
});

// ==========================================
// 7. BACKEND GOOGLE SHEETS: RSVP + LỜI CHÚC
// ==========================================
const CONFIG = window.WEDDING_CONFIG || {};
function createSubmissionId() {
  const random = crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
  return `lc_${Date.now().toString(36)}_${random}`;
}

function jsonp(params, timeout = 10000) {
  return new Promise((resolve, reject) => {
    if (!CONFIG.apiUrl) {
      reject(new Error('Backend Google Sheets chưa được cấu hình'));
      return;
    }

    const callback = `lc_callback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');
    const timer = setTimeout(
      () => finish(new Error('Hết thời gian chờ Google Sheets')),
      timeout
    );

    function finish(error, data) {
      clearTimeout(timer);
      delete window[callback];
      script.remove();

      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    }

    window[callback] = data => finish(null, data);
    script.onerror = () => finish(new Error('Không kết nối được Google Sheets'));
    script.src = `${CONFIG.apiUrl}?${new URLSearchParams({ ...params, callback })}`;
    document.head.appendChild(script);
  });
}

async function submitAndVerify(payload) {
  if (!CONFIG.apiUrl) {
    throw new Error('Backend Google Sheets chưa được cấu hình');
  }

  const id = createSubmissionId();
  await fetch(CONFIG.apiUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ ...payload, id })
  });

  for (let attempt = 0; attempt < 4; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 900 + attempt * 500));
    const result = await jsonp({ action: 'status', id });

    if (result.saved) return id;
  }

  throw new Error('Đã gửi nhưng chưa xác minh được dữ liệu trong Google Sheets');
}

async function checkBackend() {
  const state = $('#backendState');
  if (!state) return;

  if (!CONFIG.apiUrl) {
    state.textContent = 'Biểu mẫu chưa sẵn sàng. Bạn vui lòng thử lại sau hoặc nhắn trực tiếp cho Chúng mình nhé.';
    return;
  }

  try {
    const result = await jsonp({ action: 'health' });
    state.textContent = result.ok
      ? 'Biểu mẫu đã sẵn sàng. Cảm ơn bạn đã ghé thăm!'
      : 'Biểu mẫu đang gặp chút trục trặc. Bạn vui lòng thử lại sau hoặc nhắn trực tiếp cho Chúng mình nhé.';
  } catch (error) {
    console.error('Không kiểm tra được trạng thái biểu mẫu:', error);
    state.textContent =
      'Biểu mẫu đang gặp chút trục trặc. Bạn vui lòng thử lại sau hoặc nhắn trực tiếp cho Chúng mình nhé.';
  }
}

function appendWish(wish, label = 'Đã duyệt') {
  const article = document.createElement('article');
  article.className = 'wish';

  const small = document.createElement('small');
  small.textContent = label;

  const quote = document.createElement('blockquote');
  quote.textContent = wish.wish;

  const author = document.createElement('p');
  author.textContent = wish.name;

  article.append(small, quote, author);
  $('#wishList').prepend(article);
}

async function loadApprovedWishes() {
  if (!CONFIG.apiUrl) return;

  try {
    const result = await jsonp({ action: 'wishes' });
    (result.wishes || []).reverse().forEach(wish => appendWish(wish));
  } catch (error) {
    console.warn('Không tải được lời chúc:', error);
  }
}

checkBackend();
loadApprovedWishes();

$('#wishForm').onsubmit = async event => {
  event.preventDefault();

  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  const data = Object.fromEntries(new FormData(form));
  const status = $('#wishStatus');
  const button = $('button', form);

  button.disabled = true;
  status.textContent = 'Cảm ơn bạn, tụi mình đang gửi lời chúc đến Lan & Chung nhé…';

  try {
    const wish = {
      name: data.guestName.trim(),
      wish: data.wish.trim()
    };

    await submitAndVerify({ type: 'wish', ...wish });
    appendWish(wish, 'Vừa gửi');
    $('#wishList .wish')?.classList.add('is-new');

    status.textContent = 'Cảm ơn bạn đã gửi lời chúc thật dễ thương! Tụi mình đã nhận được rồi nhé.';
    form.reset();
  } catch (error) {
    console.error('Không gửi được lời chúc:', error);
    status.textContent = 'Tụi mình chưa nhận được xác nhận gửi thành công. Bạn thử lại sau hoặc nhắn trực tiếp cho Chúng mình nhé.';
  } finally {
    button.disabled = false;
  }
};

// ==========================================
// 8. FORM XÁC NHẬN THAM DỰ (RSVP) & NHẠC
// ==========================================
$('#rsvpForm').onsubmit = async event => {
  event.preventDefault();

  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  const data = Object.fromEntries(new FormData(form));
  const status = $('#rsvpStatus');
  const button = $('button', form);

  button.disabled = true;
  status.textContent = 'Cảm ơn bạn, tụi mình đang gửi phản hồi đến Lan & Chung nhé…';

  try {
    const id = await submitAndVerify({
      type: 'rsvp',
      name: data.name.trim(),
      guests: data.guests,
      event: data.event,
      attendance: data.attendance,
      phone: data.phone || '',
      message: data.message || ''
    });

    status.textContent = `Cảm ơn bạn đã phản hồi! Lan & Chung đã nhận được xác nhận của bạn. Mã xác nhận: ${id}`;
    form.reset();
  } catch (error) {
    console.error('Không gửi được xác nhận tham dự:', error);
    status.textContent = 'Tụi mình chưa nhận được xác nhận gửi thành công. Bạn thử lại sau hoặc nhắn trực tiếp cho Lan & Chung nhé.';
  } finally {
    button.disabled = false;
  }
};

const musicButton = $('#music');
const musicPlayer = $('#musicPlayer');

function startBackgroundMusic() {
  if (!musicPlayer || !musicButton) return;

  const player = document.createElement('audio');
  player.src = 'assets/audio/Hon-Ca-Yeu-Duc-Phuc.mp3';
  player.loop = true;
  player.preload = 'none';
  player.setAttribute('aria-hidden', 'true');
  player.addEventListener('play', () => {
    musicButton.classList.add('is-open');
    musicButton.setAttribute('aria-pressed', 'true');
    musicButton.setAttribute('aria-label', 'Tắt nhạc nền Hơn Cả Yêu');
    $('.music-label', musicButton).textContent = 'Tắt nhạc';
  });
  player.addEventListener('pause', () => {
    musicButton.classList.remove('is-open');
    musicButton.setAttribute('aria-pressed', 'false');
    musicButton.setAttribute('aria-label', 'Phát nhạc nền Hơn Cả Yêu');
    $('.music-label', musicButton).textContent = 'Nghe nhạc';
  });
  musicPlayer.replaceChildren(player);
  player.play().catch(error => {
    if (player.isConnected) {
      console.error('Không phát được nhạc nền:', error);
    }
  });
}

function stopBackgroundMusic() {
  if (!musicPlayer || !musicButton) return;

  const player = musicPlayer.querySelector('audio');
  if (player) {
    player.pause();
    player.currentTime = 0;
  }
  musicPlayer.replaceChildren();
  musicButton.classList.remove('is-open');
  musicButton.setAttribute('aria-pressed', 'false');
  musicButton.setAttribute('aria-label', 'Phát nhạc nền Hơn Cả Yêu');
  $('.music-label', musicButton).textContent = 'Nghe nhạc';
}

if (musicButton && musicPlayer) {
  musicButton.onclick = () => {
    const player = musicPlayer.querySelector('audio');
    if (player && !player.paused) {
      stopBackgroundMusic();
    } else {
      startBackgroundMusic();
    }
  };
}
