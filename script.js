(function () {
  'use strict';

  /* ===== Константы ===== */
  const WIN_SCORE = 60;
  const INITIAL_LIGHT = 100;
  const FOG_DAMAGE = 34;
  const CRYSTAL_LIGHT_RESTORE = 22;
  const LEVEL_INTERVAL_MS = 15000;
  const STORAGE_KEY_BEST = 'poimaiChudoBestScore';
  const STORAGE_KEY_TOPIC = 'poimaiChudoLastTopic';

  const TOPIC_LABELS = {
    relationships: 'Отношения',
    work: 'Дело и деньги',
    inner: 'Внутреннее состояние',
    path: 'Новый путь',
    question: 'Мой вопрос'
  };

  const ITEM_CONFIG = {
    spark: { className: 'falling-item--spark', points: 2, weight: 40, svg: 'spark' },
    feather: { className: 'falling-item--feather', points: 5, weight: 28, svg: 'feather' },
    key: { className: 'falling-item--key', points: 10, weight: 5, svg: 'key', glow: 'strong' },
    crystal: { className: 'falling-item--crystal', points: 5, weight: 7, svg: 'crystal', restoresLight: true, lightRestore: CRYSTAL_LIGHT_RESTORE, glow: 'strong' },
    fog: { className: 'falling-item--fog', points: 0, weight: 20, svg: 'fog', isFog: true }
  };

  const HITBOX = { left: 0.26, right: 0.26, top: 0.1, bottom: 0.06 };

  const TOPIC_MESSAGES = {
    relationships: [
      'Не торопись искать подтверждение своим чувствам в чужих словах. Обрати внимание на то, как ты ощущаешь себя рядом с человеком — там уже есть часть ответа.',
      'Иногда близость растёт не от больших жестов, а от маленькой честности в обычный день. Сегодня можно позволить себе быть чуть открытее.',
      'Если отношения кажутся запутанными, начни с простого вопроса: «Чего я на самом деле хочу чувствовать рядом с этим человеком?»',
      'Тишина между вами не всегда означает дистанцию. Иногда это пауза, в которой созревает более глубокое понимание.',
      'Тебе не нужно заслуживать тепло. Обрати внимание на тех, с кем тебе спокойно без роли и без маски.',
      'Прежде чем ждать шага от другого, спроси себя: какой маленький шаг к ясности можешь сделать ты?',
      'Чувства редко приходят в готовой формулировке. Дай себе время услышать их, не требуя немедленного решения.',
      'Знак может быть не в словах «да» или «нет», а в том, что внутри стало чуть легче дышать.'
    ],
    work: [
      'Сейчас важнее не распыляться на множество направлений. Один выбранный шаг, доведённый до результата, даст больше, чем пять начатых идей.',
      'Деньги приходят не только через усилие, но и через ясность ценности. Спроси себя: что ты уже даёшь миру, за что тебе естественно получать?',
      'Если дело кажется застоявшимся, возможно, пора не ускоряться, а убрать лишнее и оставить главное.',
      'Не каждый успешный шаг выглядит громко. Иногда самый сильный ход — это аккуратная подготовка, которую никто не видит.',
      'Тревога о будущем часто маскирует усталость от настоящего. Сегодня полезнее восстановить ресурс, чем доказывать продуктивность.',
      'Знак может указывать не на новую возможность, а на то, что уже рядом — просто ты ещё не назвал это ценным.',
      'Сравнение с чужим путём редко помогает. Вернись к своему темпу: он может быть медленнее, но точнее.',
      'Иногда рост начинается с честного «мне это не подходит» — и это тоже профессиональная зрелость.'
    ],
    inner: [
      'Тебе необязательно всё время быть сильной. Иногда возвращение к себе начинается с разрешения остановиться.',
      'Внутренний свет не гаснет навсегда — он может просто просить о более бережном отношении к себе.',
      'Если тревожно, попробуй не искать причину сразу. Сначала дай телу почувствовать опору: дыхание, тишина, один маленький заботливый жест.',
      'Ты не обязана всё понимать прямо сейчас. Достаточно заметить, что внутри стало хоть на немного тише.',
      'Знак может прийти не как ответ, а как ощущение: «Со мной всё в порядке, даже если не всё ясно».',
      'Иногда лучший способ вернуть себе ясность — перестать требовать от себя немедленной собранности.',
      'Твоё состояние не определяет твою ценность. Сегодня можно быть мягче к себе, чем вчера.',
      'Внутренний ответ часто звучит тихо. Он не кричит — он просто не исчезает, когда ты перестаёшь спорить с собой.'
    ],
    path: [
      'Новый путь редко открывается целиком. Сейчас от тебя требуется увидеть только ближайший шаг.',
      'Неопределённость — не признак ошибки. Иногда это пространство, где формируется более честное направление.',
      'Если страшно менять привычное, спроси себя: что ты теряешь, оставаясь там, где уже давно тесно?',
      'Знак может указывать не на резкий поворот, а на мягкое смещение приоритетов — начни с малого.',
      'Ты не обязана видеть всю дорогу. Достаточно почувствовать, куда хочется сделать следующий шаг без насилия над собой.',
      'Иногда новый путь начинается не с решения «куда», а с честного «чего я больше не хочу».',
      'Доверие к себе растёт не от гарантий, а от маленьких шагов, которые ты выдерживаешь до конца.',
      'Путь может открываться через любопытство, а не через давление. Сегодня можно исследовать, а не доказывать.'
    ],
    question: [
      'Ответ может проявиться не прямым знаком, а внутренним облегчением при мысли об одном из вариантов.',
      'Если вопрос не даёт покоя, попробуй переформулировать его: «Что мне важно сохранить, принимая любое решение?»',
      'Иногда знак — это не «да» или «нет», а ясное ощущение, что ты больше не хочешь оставаться в подвешенности.',
      'Тебе не нужно знать всё заранее. Достаточно заметить, какой вариант не требует от тебя предавать себя.',
      'Ответ может прийти через тело: где становится спокойнее, когда ты представляешь один из путей?',
      'Если сомневаешься, отложи решение на короткое время — не из бегства, а чтобы услышать себя без шума.',
      'Знак может быть в том, что вопрос уже изменился. Возможно, ты спрашиваешь не о том, что действительно важно.',
      'Доверься тому, что уже знаешь, но пока не разрешаешь себе признать — это тоже форма ответа.'
    ]
  };

  const DEFEAT_KICKS = [
    'Туман сомнений бывает густым — но он не определяет, кто ты. Можно вернуться, когда будешь готова.',
    'Это был не провал, а сигнал замедлиться. Иногда пауза — самая мудрая стратегия.',
    'Знаки не исчезли — они просто ждут более тихого момента. Попробуй ещё раз, без спешки.',
    'Даже опытным искательницам знаков иногда нужен второй заход. Это нормально.',
    'Ты уже сделала главное — прислушалась. Следующий раунд может быть мягче.',
    'Не поймала знак сейчас — значит, он готовит более точную форму.',
    'Чудилка не оценивает — она просто предлагает попробовать снова, когда внутри станет спокойнее.',
    'Иногда знак приходит не в игре, а в тишине после неё. Но можно и повторить.'
  ];

  const DEFEAT_PRACTICES = [
    'Сядь удобно, закрой глаза и три раза медленно выдохни. Заметь, что в теле отпускается первым.',
    'Положи ладонь на грудь и спроси себя: «Чего мне сейчас действительно не хватает?» Ответ может быть проще, чем кажется.',
    'Запиши одну мысль, которая тревожит, и одну, которая поддерживает. Посмотри, какая звучит честнее.',
    'Проведи минуту в тишине без телефона. Иногда этого достаточно, чтобы знак стал слышнее.',
    'Назови вслух одну вещь, которую ты уже сделала хорошо сегодня — даже если она кажется мелкой.',
    'Сделай три медленных вдоха и на каждом выдохе отпускай одно напряжение: в плечах, челюсти, животе.',
    'Представь, что внутренний свет — это мягкий свет свечи. Не раздувай его силой, просто прикрой от ветра.',
    'Спроси себя: «Если бы я была на стороне подруги, что бы я ей сказала?» — и адресуй это себе.'
  ];

  const DEFEAT_RITUALS = [
    'Зажги свечу или включи мягкий свет и скажи: «Я открыта слышать, когда буду готова».',
    'Потри ладони друг о друга, пока не почувствуешь тепло, и мысленно верни себе один процент спокойствия.',
    'Налей стакан воды, сделай глоток и представь, что очищаешь пространство для ясности.',
    'Открой окно на минуту или просто вдохни свежий воздух — как жест «я возвращаюсь к себе».',
    'Положи на стол один предмет, который тебя успокаивает, и посмотри на него без спешки.',
    'Шёпотом произнеси: «Мне можно не знать прямо сейчас» — и заметь, как откликается тело.',
    'Запиши на бумаге слово, которое сегодня поддерживает, и положи его на видное место.',
    'Перед сном повтори: «Знаки приходят ко мне в нужном темпе» — без требования верить сразу.'
  ];

  const DEFEAT_QUESTIONS = [
    'Что я пытаюсь услышать от знака — и могу ли я дать это себе сама?',
    'Если бы страх ошибки стал тише, какой первый шаг я бы сделала?',
    'Где я сейчас требую от себя больше, чем от ситуации?',
    'Что изменится, если я позволю себе не знать ещё один день?',
    'Какой ответ я уже знаю, но пока не принимаю?',
    'Что для меня сейчас важнее: скорость или ясность?',
    'Где я могу быть мягче к себе, не теряя направления?',
    'Если бы знак уже был рядом, как бы я это почувствовала — телом, а не умом?'
  ];

  const DEFEAT_TYPES = {
    kick: { label: 'Мягкий волшебный пинок', list: DEFEAT_KICKS },
    practice: { label: 'Небольшая практика', list: DEFEAT_PRACTICES },
    ritual: { label: 'Взрослый ритуальчик', list: DEFEAT_RITUALS },
    question: { label: 'Вопрос для размышления', list: DEFEAT_QUESTIONS }
  };

  const SVG_TEMPLATES = {
    spark: '<svg viewBox="0 0 24 24" class="symbol-svg symbol-svg--spark" aria-hidden="true"><path d="M12 2l1.8 5.5L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.5L12 2z"/></svg>',
    feather: '<svg viewBox="0 0 24 24" class="symbol-svg symbol-svg--feather" aria-hidden="true"><path d="M12 2.2C8.6 7.4 6.2 13.5 5.8 19.8c-.1 1 .6 1.8 1.5 1.4 2-1 3.7-2.8 4.7-4.8.3-.6.9-1 1.5-1s1.2.4 1.5 1c1 2 2.7 3.8 4.7 4.8.9.4 1.6-.4 1.5-1.4-.4-6.3-2.8-12.4-6.2-17.6-.3-.5-.9-.5-1.2 0z"/></svg>',
    key: '<svg viewBox="0 0 24 24" class="symbol-svg symbol-svg--key" aria-hidden="true"><path d="M8 14a5 5 0 1 1 3.5-8.5L14 8v2h2v2h2l1 5h-3l-1-3h-2v4H8v-4z"/></svg>',
    crystal: '<svg viewBox="0 0 24 24" class="symbol-svg symbol-svg--crystal" aria-hidden="true"><path d="M12 2l8 8-8 12L4 10 12 2z"/></svg>',
    fog: '<svg viewBox="0 0 24 24" class="symbol-svg symbol-svg--fog" aria-hidden="true"><ellipse cx="12" cy="14" rx="9" ry="5" fill="currentColor"/><ellipse cx="8" cy="11" rx="5" ry="3.5" fill="currentColor" opacity=".65"/></svg>'
  };

  /* ===== DOM ===== */
  const screens = {
    start: document.getElementById('screen-start'),
    game: document.getElementById('screen-game'),
    victory: document.getElementById('screen-victory'),
    defeat: document.getElementById('screen-defeat')
  };

  const hudScore = document.getElementById('hud-score');
  const hudLightFill = document.getElementById('hud-light-fill');
  const hudLightValue = document.getElementById('hud-light-value');
  const hudLevel = document.getElementById('hud-level');
  const hudBest = document.getElementById('hud-best');
  const hudTopic = document.getElementById('hud-topic');
  const gameArea = document.getElementById('game-area');
  const itemsLayer = document.getElementById('items-layer');
  const player = document.getElementById('player');
  const chudilka = player.querySelector('.chudilka');
  const chudilkaImg = player.querySelector('.chudilka-img');
  const pauseOverlay = document.getElementById('pause-overlay');
  const catchFlash = document.getElementById('catch-flash');
  const confettiCanvas = document.getElementById('confetti-canvas');

  const btnStart = document.getElementById('btn-start');
  const btnPause = document.getElementById('btn-pause');
  const btnResume = document.getElementById('btn-resume');
  const btnLeft = document.getElementById('btn-left');
  const btnRight = document.getElementById('btn-right');
  const btnVictoryReplay = document.getElementById('btn-victory-replay');
  const btnDefeatRetry = document.getElementById('btn-defeat-retry');
  const btnDefeatNewMessage = document.getElementById('btn-defeat-new-message');
  const topicButtons = document.querySelectorAll('.topic-btn');

  const victoryTopicEl = document.getElementById('victory-topic');
  const victoryScoreEl = document.getElementById('victory-score');
  const victoryMessageEl = document.getElementById('victory-message');
  const defeatScoreEl = document.getElementById('defeat-score');
  const defeatTypeLabel = document.getElementById('defeat-type-label');
  const defeatMessageEl = document.getElementById('defeat-message');

  /* ===== Состояние ===== */
  let animationId = null;
  let lastTimestamp = 0;
  let spawnAccumulator = 0;
  let levelTimer = 0;

  let score = 0;
  let innerLight = INITIAL_LIGHT;
  let level = 1;
  let bestScore = 0;
  let selectedTopic = null;
  let paused = false;
  let running = false;
  let gameOver = false;

  let playerX = 0;
  let playerWidth = 100;
  let playerHeight = 130;
  let areaWidth = 0;
  let areaHeight = 0;

  let moveLeft = false;
  let moveRight = false;
  let dragActive = false;

  const items = [];
  let lastDefeatMessageText = '';
  let lastDefeatType = null;
  let confettiAnimationId = null;

  /* ===== Утилиты ===== */
  function getMessageStorageKey(topic) {
    return 'poimaiChudoLastMsg_' + topic;
  }

  function loadLastMessageIndex(topic) {
    const stored = localStorage.getItem(getMessageStorageKey(topic));
    return stored !== null ? parseInt(stored, 10) : -1;
  }

  function saveLastMessageIndex(topic, index) {
    localStorage.setItem(getMessageStorageKey(topic), String(index));
  }

  function pickRandomMessage(list, lastIndex) {
    if (list.length === 1) return { text: list[0], index: 0 };
    let index;
    do {
      index = Math.floor(Math.random() * list.length);
    } while (index === lastIndex);
    return { text: list[index], index };
  }

  function pickDefeatMessage(list) {
    if (list.length === 1) return list[0];
    let text;
    do {
      text = list[Math.floor(Math.random() * list.length)];
    } while (text === lastDefeatMessageText);
    return text;
  }

  function pickDefeatType(forceNew) {
    const keys = Object.keys(DEFEAT_TYPES);
    if (!forceNew) return keys[Math.floor(Math.random() * keys.length)];
    const others = keys.filter(function (k) { return k !== lastDefeatType; });
    return others[Math.floor(Math.random() * others.length)];
  }

  function showScreen(name) {
    Object.keys(screens).forEach(function (key) {
      screens[key].classList.toggle('screen--active', key === name);
    });
    document.body.classList.toggle('game-active', name === 'game');
  }

  function loadBestScore() {
    const stored = localStorage.getItem(STORAGE_KEY_BEST);
    bestScore = stored ? Math.max(0, parseInt(stored, 10) || 0) : 0;
    hudBest.textContent = String(bestScore);
  }

  function saveBestScore() {
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem(STORAGE_KEY_BEST, String(bestScore));
      hudBest.textContent = String(bestScore);
    }
  }

  function updateHud() {
    hudScore.textContent = String(score);
    hudLevel.textContent = String(level);
    hudLightFill.style.width = innerLight + '%';
    hudLightValue.textContent = Math.round(innerLight) + '%';
    hudTopic.textContent = selectedTopic ? TOPIC_LABELS[selectedTopic] : '';
  }

  function getFallSpeed() {
    return 85 + (level - 1) * 18;
  }

  function getSpawnInterval() {
    return Math.max(750, 2100 - (level - 1) * 160);
  }

  function getMaxItems() {
    return Math.min(8, 3 + Math.floor((level - 1) / 2));
  }

  function pickItemType() {
    const totalWeight = Object.values(ITEM_CONFIG).reduce(function (sum, cfg) {
      return sum + cfg.weight;
    }, 0);
    let roll = Math.random() * totalWeight;

    for (const [type, cfg] of Object.entries(ITEM_CONFIG)) {
      roll -= cfg.weight;
      if (roll <= 0) return type;
    }
    return 'spark';
  }

  function measureLayout() {
    const rect = gameArea.getBoundingClientRect();
    areaWidth = rect.width;
    areaHeight = rect.height;

    const playerRect = player.getBoundingClientRect();
    if (playerRect.width > 0 && playerRect.height > 0) {
      playerWidth = playerRect.width;
      playerHeight = playerRect.height;
    }

    const maxX = Math.max(0, areaWidth - playerWidth);
    playerX = Math.min(Math.max(playerX, 0), maxX);
    updatePlayerPosition();
  }

  function updatePlayerPosition() {
    player.style.left = playerX + 'px';
  }

  function createItemElement(type) {
    const cfg = ITEM_CONFIG[type];
    const el = document.createElement('div');
    el.className = 'falling-item ' + cfg.className;
    el.innerHTML = SVG_TEMPLATES[cfg.svg];
    el.dataset.type = type;
    return el;
  }

  function spawnItem() {
    if (items.length >= getMaxItems()) return;

    const type = pickItemType();
    const cfg = ITEM_CONFIG[type];
    const el = createItemElement(type);

    const itemSize = 44;
    const x = Math.random() * Math.max(0, areaWidth - itemSize);

    const item = {
      el,
      type,
      x,
      y: -itemSize,
      width: itemSize,
      height: itemSize,
      speed: getFallSpeed() * (0.9 + Math.random() * 0.2),
      caught: false,
      removed: false
    };

    el.style.left = x + 'px';
    el.style.top = item.y + 'px';
    itemsLayer.appendChild(el);
    items.push(item);
  }

  function removeItem(item) {
    if (item.removed) return;
    item.removed = true;
    if (item.el.parentNode) item.el.parentNode.removeChild(item.el);
    const idx = items.indexOf(item);
    if (idx !== -1) items.splice(idx, 1);
  }

  function showScorePopup(x, y, text, positive) {
    const popup = document.createElement('div');
    popup.className = 'score-popup ' + (positive ? 'score-popup--positive' : 'score-popup--negative');
    popup.textContent = text;
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    gameArea.appendChild(popup);
    setTimeout(function () {
      if (popup.parentNode) popup.parentNode.removeChild(popup);
    }, 850);
  }

  function flashCatch(intensity) {
    catchFlash.classList.remove('catch-flash--strong');
    if (intensity === 'strong') catchFlash.classList.add('catch-flash--strong');
    catchFlash.classList.add('catch-flash--active');
    setTimeout(function () {
      catchFlash.classList.remove('catch-flash--active', 'catch-flash--strong');
    }, intensity === 'strong' ? 280 : 160);
  }

  function triggerPlayerAnim(className) {
    chudilka.classList.remove('chudilka--catch', 'chudilka--fog');
    void chudilka.offsetWidth;
    chudilka.classList.add(className);
    setTimeout(function () {
      chudilka.classList.remove(className);
    }, className === 'chudilka--fog' ? 600 : 320);
  }

  function handleCatch(item) {
    if (gameOver || item.caught || item.removed) return;
    item.caught = true;
    const cfg = ITEM_CONFIG[item.type];

    if (cfg.isFog) {
      item.el.classList.add('falling-item--caught');
      innerLight = Math.max(0, innerLight - FOG_DAMAGE);
      triggerPlayerAnim('chudilka--fog');
      showScorePopup(item.x, item.y, '−' + FOG_DAMAGE + '%', false);

      setTimeout(function () { removeItem(item); }, 350);

      if (innerLight <= 0) endGame(false);
      else updateHud();
      return;
    }

    score += cfg.points;
    item.el.classList.add('falling-item--caught');
    triggerPlayerAnim('chudilka--catch');
    flashCatch(cfg.glow || 'normal');

    let popupText = '+' + cfg.points;
    if (cfg.restoresLight) {
      innerLight = Math.min(100, innerLight + cfg.lightRestore);
      popupText += ' ✧';
    }
    showScorePopup(item.x, item.y, popupText, true);
    updateHud();
    saveBestScore();

    setTimeout(function () { removeItem(item); }, 350);

    if (score >= WIN_SCORE) endGame(true);
  }

  function checkCollision(item) {
    const playerBottom = 4;
    const px = playerX + playerWidth * HITBOX.left;
    const py = areaHeight - playerHeight - playerBottom + playerHeight * HITBOX.top;
    const pw = playerWidth * (1 - HITBOX.left - HITBOX.right);
    const ph = playerHeight * (1 - HITBOX.top - HITBOX.bottom);

    const ix = item.x + 8;
    const iy = item.y + 8;
    const iw = item.width - 16;
    const ih = item.height - 16;

    return px < ix + iw && px + pw > ix && py < iy + ih && py + ph > iy;
  }

  /* ===== Игровой цикл ===== */
  function gameLoop(timestamp) {
    if (!running) return;

    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = Math.min(timestamp - lastTimestamp, 50);
    lastTimestamp = timestamp;

    if (!paused && !gameOver) {
      levelTimer += delta;
      if (levelTimer >= LEVEL_INTERVAL_MS) {
        levelTimer -= LEVEL_INTERVAL_MS;
        level += 1;
        updateHud();
      }

      spawnAccumulator += delta;
      const spawnInterval = getSpawnInterval();
      while (spawnAccumulator >= spawnInterval) {
        spawnItem();
        spawnAccumulator -= spawnInterval;
      }

      const moveSpeed = 320;
      if (moveLeft && !dragActive) {
        playerX = Math.max(0, playerX - moveSpeed * (delta / 1000));
      }
      if (moveRight && !dragActive) {
        playerX = Math.min(areaWidth - playerWidth, playerX + moveSpeed * (delta / 1000));
      }

      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (item.caught || item.removed) continue;

        item.y += item.speed * (delta / 1000);
        item.el.style.top = item.y + 'px';

        if (checkCollision(item)) {
          handleCatch(item);
          continue;
        }

        if (item.y > areaHeight) {
          if (item.type === 'fog') {
            item.el.classList.add('falling-item--missed-fog');
            setTimeout(function () { removeItem(item); }, 500);
          } else {
            removeItem(item);
          }
        }
      }
    }

    updatePlayerPosition();
    animationId = requestAnimationFrame(gameLoop);
  }

  function startLoop() {
    stopLoop();
    lastTimestamp = 0;
    animationId = requestAnimationFrame(gameLoop);
  }

  function stopLoop() {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    lastTimestamp = 0;
  }

  /* ===== Управление ===== */
  function setPlayerFromClientX(clientX) {
    const rect = gameArea.getBoundingClientRect();
    const relativeX = clientX - rect.left - playerWidth / 2;
    playerX = Math.max(0, Math.min(areaWidth - playerWidth, relativeX));
    updatePlayerPosition();
  }

  function onKeyDown(e) {
    if (!running || gameOver) return;

    if (e.key === 'Escape') {
      togglePause();
      return;
    }

    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      e.preventDefault();
    }

    if (paused) return;

    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveLeft = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveRight = true;
  }

  function onKeyUp(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveLeft = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveRight = false;
  }

  function onTouchStart(e) {
    if (!running || paused || gameOver) return;
    if (e.target.closest('.btn--control')) return;
    dragActive = true;
    if (e.cancelable) e.preventDefault();
    const touch = e.touches[0];
    if (touch) setPlayerFromClientX(touch.clientX);
  }

  function onTouchMove(e) {
    if (!running || paused || gameOver || !dragActive) return;
    if (e.cancelable) e.preventDefault();
    const touch = e.touches[0];
    if (touch) setPlayerFromClientX(touch.clientX);
  }

  function onTouchEnd() { dragActive = false; }

  function onMouseDown(e) {
    if (!running || paused || gameOver) return;
    if (e.button !== 0) return;
    dragActive = true;
    e.preventDefault();
    setPlayerFromClientX(e.clientX);
  }

  function onMouseMove(e) {
    if (!running || paused || gameOver || !dragActive) return;
    e.preventDefault();
    setPlayerFromClientX(e.clientX);
  }

  function onMouseUp() { dragActive = false; }

  function bindControlButton(btn, direction) {
    const start = function (e) {
      if (e.cancelable) e.preventDefault();
      if (direction === 'left') moveLeft = true;
      else moveRight = true;
      btn.classList.add('btn--control--active');
    };
    const stop = function (e) {
      if (e.cancelable) e.preventDefault();
      if (direction === 'left') moveLeft = false;
      else moveRight = false;
      btn.classList.remove('btn--control--active');
    };

    btn.addEventListener('mousedown', start);
    btn.addEventListener('mouseup', stop);
    btn.addEventListener('mouseleave', stop);
    btn.addEventListener('touchstart', start, { passive: false });
    btn.addEventListener('touchend', stop, { passive: false });
    btn.addEventListener('touchcancel', stop, { passive: false });
  }

  /* ===== Пауза ===== */
  function togglePause() {
    if (!running || gameOver) return;
    paused = !paused;
    if (paused) {
      moveLeft = false;
      moveRight = false;
      dragActive = false;
    }
    pauseOverlay.hidden = !paused;
    btnPause.setAttribute('aria-label', paused ? 'Продолжить игру' : 'Поставить игру на паузу');
    btnPause.textContent = paused ? '▶' : '⏸';
  }

  function resumeGame() {
    if (!paused) return;
    paused = false;
    pauseOverlay.hidden = true;
    btnPause.setAttribute('aria-label', 'Поставить игру на паузу');
    btnPause.textContent = '⏸';
    gameArea.focus();
  }

  /* ===== Золотые искры ===== */
  function stopSparks() {
    if (confettiAnimationId !== null) {
      cancelAnimationFrame(confettiAnimationId);
      confettiAnimationId = null;
    }
    const ctx = confettiCanvas.getContext('2d');
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }

  function startSparks() {
    stopSparks();

    const rect = screens.victory.getBoundingClientRect();
    confettiCanvas.width = rect.width;
    confettiCanvas.height = rect.height;

    const ctx = confettiCanvas.getContext('2d');
    const particles = [];

    for (let i = 0; i < 36; i++) {
      particles.push({
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * confettiCanvas.height,
        r: 1 + Math.random() * 2.5,
        alpha: 0.2 + Math.random() * 0.5,
        speedY: 0.3 + Math.random() * 0.8,
        speedX: (Math.random() - 0.5) * 0.4,
        pulse: Math.random() * Math.PI * 2
      });
    }

    let frame = 0;
    const maxFrames = 540;

    function draw() {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

      particles.forEach(function (p) {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.pulse += 0.02;

        if (p.y < -10) {
          p.y = confettiCanvas.height + 10;
          p.x = Math.random() * confettiCanvas.width;
        }

        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 200, 66, ' + a + ')';
        ctx.fill();
      });

      frame += 1;
      if (frame < maxFrames) confettiAnimationId = requestAnimationFrame(draw);
    }

    draw();
  }

  /* ===== Экраны результата ===== */
  function showVictoryScreen() {
    const messages = TOPIC_MESSAGES[selectedTopic] || TOPIC_MESSAGES.question;
    const lastIndex = loadLastMessageIndex(selectedTopic);
    const picked = pickRandomMessage(messages, lastIndex);
    saveLastMessageIndex(selectedTopic, picked.index);

    victoryTopicEl.textContent = 'Тема: «' + TOPIC_LABELS[selectedTopic] + '»';
    victoryScoreEl.textContent = String(score);
    victoryMessageEl.textContent = picked.text;

    showScreen('victory');
    requestAnimationFrame(startSparks);
  }

  function showDefeatContent(forceNew) {
    const typeKey = pickDefeatType(forceNew);
    const typeData = DEFEAT_TYPES[typeKey];
    const messageText = pickDefeatMessage(typeData.list);

    lastDefeatType = typeKey;
    lastDefeatMessageText = messageText;
    defeatTypeLabel.textContent = typeData.label;
    defeatMessageEl.textContent = messageText;

    const content = document.getElementById('defeat-content');
    content.style.animation = 'none';
    void content.offsetWidth;
    content.style.animation = '';
  }

  function showDefeatScreen() {
    defeatScoreEl.textContent = String(score);
    showDefeatContent(false);
    showScreen('defeat');
  }

  function endGame(won) {
    if (gameOver) return;
    gameOver = true;
    running = false;
    saveBestScore();
    stopLoop();

    moveLeft = false;
    moveRight = false;
    dragActive = false;
    btnLeft.classList.remove('btn--control--active');
    btnRight.classList.remove('btn--control--active');

    setTimeout(function () {
      if (won) showVictoryScreen();
      else showDefeatScreen();
    }, 400);
  }

  /* ===== Сброс и старт ===== */
  function clearItems() {
    while (items.length) removeItem(items[0]);
    itemsLayer.innerHTML = '';
  }

  function resetGameState() {
    stopLoop();
    stopSparks();

    score = 0;
    innerLight = INITIAL_LIGHT;
    level = 1;
    paused = false;
    running = false;
    gameOver = false;
    spawnAccumulator = 0;
    levelTimer = 0;
    moveLeft = false;
    moveRight = false;
    dragActive = false;

    pauseOverlay.hidden = true;
    btnPause.setAttribute('aria-label', 'Поставить игру на паузу');
    btnPause.textContent = '⏸';
    btnLeft.classList.remove('btn--control--active');
    btnRight.classList.remove('btn--control--active');

    clearItems();
    updateHud();
  }

  function startGame() {
    if (!selectedTopic) return;

    resetGameState();
    showScreen('game');
    localStorage.setItem(STORAGE_KEY_TOPIC, selectedTopic);

    requestAnimationFrame(function () {
      function beginPlay() {
        measureLayout();
        playerX = (areaWidth - playerWidth) / 2;
        updatePlayerPosition();
        running = true;
        startLoop();
        gameArea.focus();
      }

      if (chudilkaImg && !chudilkaImg.complete) {
        chudilkaImg.addEventListener('load', beginPlay, { once: true });
      } else {
        beginPlay();
      }
    });
  }

  function goToStart() {
    stopLoop();
    stopSparks();
    running = false;
    showScreen('start');
  }

  function selectTopic(topic) {
    selectedTopic = topic;
    topicButtons.forEach(function (btn) {
      const isActive = btn.dataset.topic === topic;
      btn.classList.toggle('topic-btn--active', isActive);
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });
    btnStart.disabled = false;
  }

  /* ===== События ===== */
  topicButtons.forEach(function (btn) {
    btn.setAttribute('role', 'radio');
    btn.addEventListener('click', function () {
      selectTopic(btn.dataset.topic);
    });
  });

  btnStart.addEventListener('click', startGame);
  btnVictoryReplay.addEventListener('click', goToStart);
  btnDefeatRetry.addEventListener('click', goToStart);
  btnDefeatNewMessage.addEventListener('click', function () {
    showDefeatContent(true);
  });

  btnPause.addEventListener('click', togglePause);
  btnResume.addEventListener('click', resumeGame);

  bindControlButton(btnLeft, 'left');
  bindControlButton(btnRight, 'right');

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  gameArea.addEventListener('touchstart', onTouchStart, { passive: false });
  gameArea.addEventListener('touchmove', onTouchMove, { passive: false });
  gameArea.addEventListener('touchend', onTouchEnd);
  gameArea.addEventListener('touchcancel', onTouchEnd);
  gameArea.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  window.addEventListener('resize', function () {
    if (screens.game.classList.contains('screen--active')) measureLayout();
  });

  document.addEventListener('touchmove', function (e) {
    if (document.body.classList.contains('game-active') && e.target.closest('#screen-game')) {
      if (e.cancelable) e.preventDefault();
    }
  }, { passive: false });

  if (chudilkaImg) {
    chudilkaImg.addEventListener('load', function () {
      if (screens.game.classList.contains('screen--active')) measureLayout();
    });
  }

  /* ===== Инициализация ===== */
  loadBestScore();
  const savedTopic = localStorage.getItem(STORAGE_KEY_TOPIC);
  if (savedTopic && TOPIC_LABELS[savedTopic]) selectTopic(savedTopic);
  showScreen('start');
})();
