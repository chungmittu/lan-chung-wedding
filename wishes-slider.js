(function () {
  const list =
    document.querySelector('#wishList');

  if (!list) {
    return;
  }

  list.classList.add('wish-slider');

  const controls =
    document.createElement('div');

  controls.className =
    'wish-slider-controls';

  controls.innerHTML = `
    <button
      type="button"
      class="wish-prev"
      aria-label="Lời chúc trước"
    >
      ←
    </button>

    <div
      class="wish-slider-dots"
      aria-label="Chọn lời chúc"
    ></div>

    <span
      class="wish-slider-counter"
      aria-live="polite"
    ></span>

    <button
      type="button"
      class="wish-next"
      aria-label="Lời chúc tiếp theo"
    >
      →
    </button>
  `;

  list.insertAdjacentElement(
    'afterend',
    controls
  );

  let index = 0;
  let timer = null;

  const dots =
    controls.querySelector(
      '.wish-slider-dots'
    );

  const counter =
    controls.querySelector(
      '.wish-slider-counter'
    );

  function cards() {
    return [
      ...list.querySelectorAll(
        '.wish'
      )
    ];
  }

  function render(
    nextIndex = index
  ) {
    const items = cards();

    if (!items.length) {
      controls.hidden = true;
      return;
    }

    controls.hidden = false;

    index =
      (
        nextIndex +
        items.length
      ) %
      items.length;

    items.forEach(
      (card, cardIndex) => {
        card.classList.toggle(
          'is-active',
          cardIndex === index
        );
      }
    );

    const dotButtons =
      items.map((item, dotIndex) => {
        const dot =
          document.createElement(
            'button'
          );

        dot.type = 'button';

        dot.setAttribute(
          'aria-label',
          `Xem lời chúc ${
            dotIndex + 1
          }`
        );

        dot.classList.toggle(
          'is-active',
          dotIndex === index
        );

        dot.onclick = () => {
          render(dotIndex);
          restart();
        };

        return dot;
      });

    dots.replaceChildren(
      ...dotButtons
    );

    counter.textContent =
      `${index + 1} / ${items.length}`;
  }

  function restart() {
    clearInterval(timer);

    const reducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

    if (!reducedMotion) {
      timer =
        setInterval(() => {
          render(index + 1);
        }, 6000);
    }
  }

  controls
    .querySelector('.wish-prev')
    .onclick = () => {
      render(index - 1);
      restart();
    };

  controls
    .querySelector('.wish-next')
    .onclick = () => {
      render(index + 1);
      restart();
    };

  list.addEventListener(
    'mouseenter',
    () => {
      clearInterval(timer);
    }
  );

  list.addEventListener(
    'mouseleave',
    restart
  );

  /*
   * Phát hiện lời chúc được tải từ
   * Google Sheets hoặc vừa gửi.
   */
  const observer =
    new Mu*ationObserver(() => {
      render*0);
      restart();
    });

  ob*erver.observe(
    list,
    {
   *  childList: true
    }
  );

  re*der(0);
  restart();
})();
