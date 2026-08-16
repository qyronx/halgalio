"use strict";

// ---- tiny DOM helpers ----
const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
};

// ---- synthesized bell sound (Web Audio API, no audio file needed) ----
let audioCtx = null;
function getAudioCtx() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  return audioCtx;
}
// Inharmonic partials (non-integer multiples of the fundamental) give the
// sine tones a metallic "bell" character instead of sounding like a flute.
function playChime(fundamental, duration, partials) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  for (const [mult, peak] of partials) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = fundamental * mult;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }
}
function playBellDing() {
  playChime(1300, 0.9, [
    [1, 0.3],
    [2.4, 0.12],
    [3.8, 0.06],
  ]);
}
function playBellThud() {
  playChime(260, 0.35, [
    [1, 0.25],
    [1.8, 0.08],
  ]);
}

// ---- i18n: browser language decides Korean vs English for the whole UI.
// navigator.language alone is only the FIRST entry of the browser's content-
// language list (chrome://settings/languages) - that list is separate from
// the browser's display/menu language, so checking the full navigator.
// languages list catches Korean wherever it appears in the user's prefs.
const LANG = (() => {
  const prefs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"];
  return prefs.some((l) => l.toLowerCase().startsWith("ko")) ? "ko" : "en";
})();

const FRUIT_NAMES_KO = { strawberry: "딸기", lime: "라임", banana: "바나나", plum: "자두" };
function fruitName(fruit) {
  return LANG === "ko" ? FRUIT_NAMES_KO[fruit] || fruit : fruit;
}

const I18N = {
  en: {
    welcomeTitle: "Welcome to HalGal",
    welcomeSubtitle: "The classic fruit-slapping speed game (Halli Galli). Pick a nickname to jump in - no account needed.",
    nicknamePlaceholder: "Nickname",
    playButton: "Play",
    createRoomButton: "+ Create Room",
    quickMatchLabel: "Quick Match",
    roomCodePlaceholder: "Private room code",
    joinButton: "Join",
    cancelButton: "Cancel",
    publicRoomsHeading: "Public Rooms",
    liveGamesHeading: "Live Games",
    watchButton: "Watch",
    noLiveGames: "No live games to spectate right now.",
    noSearchResults: (q) => `No rooms match "${q}".`,
    roomSearchPlaceholder: "Search rooms by name...",
    spectatingBadge: "👁 Spectating",
    codeLabel: "Code:",
    copyButton: "Copy",
    leaveButton: "Leave",
    startGameButton: "Start Game",
    leaveGameAria: "Leave game",
    kbdHints: "Space = Ring Bell   ·   Q = Flip Card",
    potBannerSuffix: "cards buried under the bell",
    flipCardButton: "Flip Card",
    ringBellAria: "Ring the bell",
    playAgainButton: "Play Again",
    leaveRoomButton: "Leave Room",
    createRoomTitle: "Create Room",
    roomNameLabel: "Room name",
    myRoomPlaceholder: "My Room",
    publicCheckboxLabel: "Public (listed for anyone to join)",
    playersLabel: "Players",
    createButton: "Create",
    botButton: "Bot",
    botModalTitle: "Bot Mode",
    botModalSubtitle: "Select difficulty",
    easy: "Easy",
    easyDesc: "Relaxed pace",
    normal: "Normal",
    normalDesc: "Balanced speed & accurate",
    hard: "Hard",
    hardDesc: "Lightning fast reaction time",
    startBotGame: "START",
    enterNicknamePrompt: "Please enter a nickname first.",
    okButton: "OK",

    roomEmpty: "No public rooms right now - create one!",
    hostPrefix: (name) => `host: ${name}`,
    publicLabel: "Public",
    privateLabel: "Private",
    randomMatchLabel: "Random Match",
    makePrivate: "Make Private",
    makePublic: "Make Public",
    youSuffix: " (you)",
    kickButton: "Kick",
    kickBlockButton: "Kick + Block",
    makeHostButton: "Make Host",
    hostHint: "You're the host. Start whenever everyone's ready.",
    guestHint: "Waiting for the host to start the game...",
    searching: (size) => `Searching for a ${size}-player match...`,
    searchingWithCount: (count, needed) => `Searching for a ${needed}-player match... (${count}/${needed} waiting)`,
    yourTurn: "Your turn to flip",
    theirTurn: (name) => `${name}'s turn to flip`,
    roundOver: "Round over",
    deckCount: (n) => `${n} in deck`,
    cardBackEmpty: "empty",
    gameOverWinner: (name) => `${name} wins!`,
    gameOverNoWinner: "Game over",
    scoreLine: (name, n) => `${name}: ${n} cards`,

    logStart: "The round has started!",
    logSkip: (name) => `${name} had no cards left to flip.`,
    logFlip: (name, n, fruit) => `${name} flipped ${n}× ${fruit}.`,
    logTimeoutFlip: (name, n, fruit) => `⏱ ${name} ran out of time - auto-flipped ${n}× ${fruit}.`,
    logLastChance: (name) => `⚠️ ${name} is out of cards - one last chance to win a pot before elimination.`,
    logEliminated: (name) => `💀 ${name} couldn't recover any cards and is out.`,
    logDisqualified: (name) => `🚫 ${name} was disqualified for 3 turn timeouts.`,
    logBellCorrect: (name, n) => `🔔 ${name} rang correctly and won ${n} card${n === 1 ? "" : "s"}!`,
    logBellWrongCard: (name, n, fruit) => `${name} rang incorrectly - their ${n}× ${fruit} got buried under the bell.`,
    logBellWrong: (name) => `${name} rang incorrectly.`,
    logBellLate: (name) => `${name} was just a moment too late.`,
    logGameOver: "The game has ended.",

    bellCorrect: (name, n) => `🔔 ${name} rang the bell - correct! Collected ${n} card${n === 1 ? "" : "s"}.`,
    bellWrong: (name) => `❌ ${name} rang the bell - wrong ring.`,
    disconnectedServer: "Disconnected from server.",
    removedByHost: "You were removed from the room by the host.",
    removedFromRoom: "You were removed from the room.",
    genericError: "Something went wrong.",
    codeCopied: "Room code copied.",

    chatToggleAria: "Toggle chat",
    closeAria: "Close chat",
    chatTitle: "Room Chat",
    chatPlaceholder: "Type a message...",
    chatSendButton: "Send",
    chatEmpty: "No messages yet - say hi!",
    chatYouSuffix: " (you)",
  },
  ko: {
    welcomeTitle: "HalGal에 오신 걸 환영해요",
    welcomeSubtitle: "추억의 카드 게임 할리갈리! 닉네임만 정하면 바로 대전할 수 있어요 - 계정 필요 없음.",
    nicknamePlaceholder: "닉네임",
    playButton: "시작하기",
    createRoomButton: "+ 방 만들기",
    quickMatchLabel: "빠른 매칭",
    roomCodePlaceholder: "비공개 방 코드",
    joinButton: "참가",
    cancelButton: "취소",
    publicRoomsHeading: "공개 방 목록",
    liveGamesHeading: "진행 중인 게임",
    watchButton: "관전하기",
    noLiveGames: "지금은 관전할 수 있는 게임이 없어요.",
    noSearchResults: (q) => `"${q}"와 일치하는 방이 없어요.`,
    roomSearchPlaceholder: "방 이름으로 검색...",
    spectatingBadge: "👁 관전 중",
    codeLabel: "코드:",
    copyButton: "복사",
    leaveButton: "나가기",
    startGameButton: "게임 시작",
    leaveGameAria: "게임 나가기",
    kbdHints: "스페이스 = 종 치기   ·   Q = 카드 뒤집기",
    potBannerSuffix: "장이 종 밑에 묻혀있어요",
    flipCardButton: "카드 뒤집기",
    ringBellAria: "종 치기",
    playAgainButton: "다시 하기",
    leaveRoomButton: "방 나가기",
    createRoomTitle: "방 만들기",
    roomNameLabel: "방 이름",
    myRoomPlaceholder: "내 방",
    publicCheckboxLabel: "공개 (누구나 목록에서 참가 가능)",
    playersLabel: "인원",
    createButton: "만들기",
    botButton: "Bot",
    botModalTitle: "봇전 모드",
    botModalSubtitle: "봇 난이도를 선택하세요",
    easy: "쉬움",
    easyDesc: "느긋한 속도",
    normal: "보통",
    normalDesc: "적절한 속도 & 정확함",
    hard: "어려움",
    hardDesc: "번개처럼 빠른 반응 속도",
    startBotGame: "START",
    enterNicknamePrompt: "먼저 닉네임을 입력해주세요.",
    okButton: "확인",

    roomEmpty: "지금은 공개 방이 없어요 - 방을 만들어보세요!",
    hostPrefix: (name) => `방장: ${name}`,
    publicLabel: "공개",
    privateLabel: "비공개",
    randomMatchLabel: "랜덤 매칭",
    makePrivate: "비공개로 전환",
    makePublic: "공개로 전환",
    youSuffix: " (나)",
    kickButton: "추방",
    kickBlockButton: "추방 + 차단",
    makeHostButton: "방장 위임",
    hostHint: "당신이 방장이에요. 준비되면 시작하세요.",
    guestHint: "방장이 게임을 시작하길 기다리는 중...",
    searching: (size) => `${size}인 매칭을 찾는 중...`,
    searchingWithCount: (count, needed) => `${needed}인 매칭을 찾는 중... (${count}/${needed}명 대기 중)`,
    yourTurn: "당신의 차례예요",
    theirTurn: (name) => `${name}님의 차례예요`,
    roundOver: "라운드 종료",
    deckCount: (n) => `덱에 ${n}장`,
    cardBackEmpty: "없음",
    gameOverWinner: (name) => `${name}님 승리!`,
    gameOverNoWinner: "게임 종료",
    scoreLine: (name, n) => `${name}: 카드 ${n}장`,

    logStart: "라운드가 시작됐어요!",
    logSkip: (name) => `${name}님은 뒤집을 카드가 없었어요.`,
    logFlip: (name, n, fruit) => `${name}님이 ${fruit} ${n}개를 뒤집었어요.`,
    logTimeoutFlip: (name, n, fruit) => `⏱ ${name}님이 시간 초과로 자동으로 ${fruit} ${n}개를 뒤집었어요.`,
    logLastChance: (name) => `⚠️ ${name}님은 카드가 없어요 - 탈락 전 마지막 기회예요.`,
    logEliminated: (name) => `💀 ${name}님은 카드를 회수하지 못해 탈락했어요.`,
    logDisqualified: (name) => `🚫 ${name}님은 시간 초과 3회로 실격됐어요.`,
    logBellCorrect: (name, n) => `🔔 ${name}님이 종을 정확히 쳐서 카드 ${n}장을 가져갔어요!`,
    logBellWrongCard: (name, n, fruit) => `${name}님이 종을 잘못 쳤어요 - ${fruit} ${n}개가 종 밑에 묻혔어요.`,
    logBellWrong: (name) => `${name}님이 종을 잘못 쳤어요.`,
    logBellLate: (name) => `${name}님이 아주 조금 늦었어요.`,
    logGameOver: "게임이 종료됐어요.",

    bellCorrect: (name, n) => `🔔 ${name}님이 종을 쳤어요 - 정답! 카드 ${n}장을 가져갔어요.`,
    bellWrong: (name) => `❌ ${name}님이 종을 쳤어요 - 오답이에요.`,
    disconnectedServer: "서버와 연결이 끊겼어요.",
    removedByHost: "방장에 의해 방에서 추방됐어요.",
    removedFromRoom: "방에서 제거됐어요.",
    genericError: "문제가 발생했어요.",
    codeCopied: "방 코드가 복사됐어요.",

    chatToggleAria: "채팅 열기/닫기",
    closeAria: "채팅 닫기",
    chatTitle: "대기방 채팅",
    chatPlaceholder: "메시지를 입력하세요...",
    chatSendButton: "전송",
    chatEmpty: "아직 메시지가 없어요 - 인사해보세요!",
    chatYouSuffix: " (나)",
  },
};
const t = (key, ...args) => {
  const v = I18N[LANG][key];
  return typeof v === "function" ? v(...args) : v;
};

// Server-originated error strings (from Go) aren't run through i18n on the
// backend - they're plain English. This maps the exact strings to Korean;
// anything not listed here (e.g. a future error the map hasn't caught up
// to yet) just falls back to the original English rather than breaking.
const SERVER_ERRORS_KO = {
  "can't change that right now": "지금은 변경할 수 없어요",
  "can't transfer host": "방장을 위임할 수 없어요",
  "unknown message type": "알 수 없는 요청이에요",
  "you're not in a room": "방에 참가하지 않은 상태예요",
  "room no longer exists": "더 이상 존재하지 않는 방이에요",
  "leave your current room first": "먼저 현재 방을 나가주세요",
  "room not found": "방을 찾을 수 없어요",
  "invalid match size": "잘못된 매칭 인원이에요",
  "already searching": "이미 매칭을 찾는 중이에요",
  "slow down": "너무 빨라요, 천천히 해주세요",
  "bad message": "잘못된 요청이에요",
  "game already in progress": "이미 게임이 진행 중이에요",
  "room is full": "방이 가득 찼어요",
  "you were removed from this room": "이 방에서 추방됐어요",
  "not your turn": "당신의 차례가 아니에요",
  "not in this room": "이 방에 있지 않아요",
  "random matches can't be replayed - start a new quick match": "랜덤 매칭은 다시 플레이할 수 없어요 - 새로 빠른 매칭을 시작해주세요",
  "no finished game to return from": "돌아갈 종료된 게임이 없어요",
  "only the host can start": "방장만 게임을 시작할 수 있어요",
  "game already started": "이미 게임이 시작됐어요",
  "not enough players": "인원이 부족해요",
  "only the host can kick": "방장만 추방할 수 있어요",
  "cannot kick during a game": "게임 중에는 추방할 수 없어요",
  "cannot kick yourself": "자기 자신은 추방할 수 없어요",
  "player not found": "플레이어를 찾을 수 없어요",
};
function translateServerError(msg) {
  if (LANG === "ko" && SERVER_ERRORS_KO[msg]) return SERVER_ERRORS_KO[msg];
  return msg;
}

// Translate every element marked up in index.html - runs once at load. The
// script tag is at the end of <body>, so the DOM is already parsed.
function applyStaticI18n() {
  document.documentElement.lang = LANG;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const val = t(node.getAttribute("data-i18n"));
    if (typeof val === "string") node.textContent = val;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.placeholder = t(node.getAttribute("data-i18n-placeholder"));
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
    node.setAttribute("aria-label", t(node.getAttribute("data-i18n-aria")));
  });
}
applyStaticI18n();

let ws = null;
let myId = null;
let pendingNickname = "";
let pendingBotDifficulty = null;
let myNickname = "";
let currentRoom = null; // last "sync" payload
// Spectators are never added to the room's Players list server-side, so we
// can tell locally: if myId isn't among currentRoom.players, we're watching
// read-only. Recomputed on every renderGame() call.
let amSpectating = false;
let lobbyTimer = null;
let toastTimer = null;

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
}

function toast(msg, variant) {
  const box = $("toast");
  box.textContent = msg;
  box.classList.remove("toast-success", "toast-error");
  box.classList.add(variant === "success" ? "toast-success" : "toast-error");
  box.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => box.classList.add("hidden"), 3200);
}

function send(type, data) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify(Object.assign({ type }, data || {})));
}

// ---- connection ----
function connect() {
  const proto = location.protocol === "https:" ? "wss:" : "ws:";
  ws = new WebSocket(`wss://halgalio.onrender.com/ws`);
  ws.onmessage = (ev) => {
    let msg;
    try {
      msg = JSON.parse(ev.data);
    } catch (e) {
      return;
    }
    handleMessage(msg);
  };
  ws.onclose = () => {
    toast(t("disconnectedServer"));
    stopLobbyPolling();
    currentRoom = null;
    showScreen("screen-name");
  };
}

function handleMessage(msg) {
  switch (msg.type) {
    case "welcome":
      myId = msg.playerId;
      send("set_nickname", { nickname: pendingNickname });
      break;
    case "nickname_ack":
      myNickname = msg.nickname;
      $("who").textContent = myNickname;
      if (pendingBotDifficulty) {
        const diff = pendingBotDifficulty;
        pendingBotDifficulty = null;
        send("create_bot_game", { difficulty: diff });
      } else {
        enterLobby();
      }
      break;
    case "room_list":
      lastJoinableRooms = msg.rooms || [];
      lastSpectatableRooms = msg.spectatable || [];
      applyRoomSearch();
      break;
    case "queued":
      showQueueBanner(msg.size);
      break;
    case "queue_update":
      updateQueueCount(msg.size, msg.count, msg.needed);
      break;
    case "queue_cancelled":
      hideQueueBanner();
      break;
    case "match_found":
      break;
    case "sync":
      onSync(msg);
      break;
    case "kicked":
      toast(msg.permanent ? t("removedByHost") : t("removedFromRoom"));
      backToLobbyLocal();
      break;
    case "left_room":
      backToLobbyLocal();
      break;
    case "chat":
      onChatMessage(msg);
      break;
    case "error":
      toast(msg.message ? translateServerError(msg.message) : t("genericError"));
      break;
  }
}

function backToLobbyLocal() {
  currentRoom = null;
  enterLobby();
}

function enterLobby() {
  hideQueueBanner();
  hideRoomChat();
  roomChatOpenFor = null;
  showScreen("screen-lobby");
  refreshRoomList();
  startLobbyPolling();
}

function startLobbyPolling() {
  stopLobbyPolling();
  lobbyTimer = setInterval(refreshRoomList, 4000);
}
function stopLobbyPolling() {
  if (lobbyTimer) clearInterval(lobbyTimer);
  lobbyTimer = null;
}
function refreshRoomList() {
  send("list_rooms");
}

function renderRoomRows(containerId, rooms, emptyText, buttonLabel, onAction) {
  const list = $(containerId);
  list.innerHTML = "";
  if (rooms.length === 0) {
    list.appendChild(el("div", "room-empty", emptyText));
    return;
  }
  for (const r of rooms) {
    const row = el("div", "room-row");
    const left = el("div");
    const name = el("span", "r-name", r.name);
    const host = el("span", "r-host", r.host ? t("hostPrefix", r.host) : "");
    left.appendChild(name);
    left.appendChild(host);
    const right = el("div");
    right.appendChild(el("span", "badge", `${r.count}/${r.max}`));
    const actionBtn = el("button", "btn small", buttonLabel);
    actionBtn.style.marginLeft = "10px";
    actionBtn.addEventListener("click", () => onAction(r.id));
    right.appendChild(actionBtn);
    row.appendChild(left);
    row.appendChild(right);
    list.appendChild(row);
  }
}

// Raw lists from the last "room_list" message - kept around so the search
// box can re-filter instantly client-side without a round-trip.
let lastJoinableRooms = [];
let lastSpectatableRooms = [];

function applyRoomSearch() {
  const q = $("input-room-search").value.trim().toLowerCase();
  const matches = (r) => !q || r.name.toLowerCase().includes(q);
  const emptyText = (fallback) => (q ? t("noSearchResults", $("input-room-search").value.trim()) : fallback);

  renderRoomRows(
    "room-list",
    lastJoinableRooms.filter(matches),
    emptyText(t("roomEmpty")),
    t("joinButton"),
    (id) => send("join_room", { roomId: id })
  );
  renderRoomRows(
    "spectate-list",
    lastSpectatableRooms.filter(matches),
    emptyText(t("noLiveGames")),
    t("watchButton"),
    (id) => send("spectate", { roomId: id })
  );
}
$("input-room-search").addEventListener("input", applyRoomSearch);

let activeQueueSize = null;

function showQueueBanner(size) {
  activeQueueSize = size;
  $("queue-text").textContent = t("searching", size);
  $("queue-banner").classList.remove("hidden");
}
function updateQueueCount(size, count, needed) {
  if (size !== activeQueueSize) return; // stale update from a cancelled queue
  $("queue-text").textContent = t("searchingWithCount", count, needed);
}
function hideQueueBanner() {
  activeQueueSize = null;
  $("queue-banner").classList.add("hidden");
}

// ---- sync dispatch ----
function onSync(msg) {
  currentRoom = msg;
  if (msg.state === "waiting") {
    stopLobbyPolling();
    showScreen("screen-room");
    renderRoom(msg);
  } else {
    stopLobbyPolling();
    showScreen("screen-game");
    renderGame(msg);
    // Chat only ever applies to the friend-room waiting screen - hide it
    // the moment a round starts so it can't float on top of the game UI.
    hideRoomChat();
  }
}

// ---- room (waiting) screen ----
function renderRoom(r) {
  $("room-name").textContent = r.roomName;
  $("room-visibility").textContent = r.isRandom ? t("randomMatchLabel") : r.isPublic ? t("publicLabel") : t("privateLabel");

  const codeWrap = $("room-code-wrap");
  if (!r.isPublic && !r.isRandom) {
    codeWrap.classList.remove("hidden");
    $("room-code").textContent = r.roomId;
  } else {
    codeWrap.classList.add("hidden");
  }

  const iAmHost = r.hostId === myId;

  const toggleBtn = $("btn-toggle-public");
  if (iAmHost && !r.isRandom) {
    toggleBtn.classList.remove("hidden");
    toggleBtn.textContent = r.isPublic ? t("makePrivate") : t("makePublic");
    toggleBtn.onclick = () => send("set_public", { isPublic: !r.isPublic });
  } else {
    toggleBtn.classList.add("hidden");
  }

  const list = $("player-list");
  list.innerHTML = "";
  for (const p of r.players) {
    const li = el("li");
    const nameWrap = el("div", "player-name");
    if (p.isHost) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
      use.setAttribute("href", "#icon-crown");
      svg.appendChild(use);
      nameWrap.appendChild(svg);
    }
    nameWrap.appendChild(document.createTextNode(p.nickname + (p.id === myId ? t("youSuffix") : "")));
    li.appendChild(nameWrap);

    if (iAmHost && !r.isRandom && p.id !== myId) {
      const actions = el("div", "player-actions");
      const kickBtn = el("button", "btn tiny", t("kickButton"));
      kickBtn.addEventListener("click", () => send("kick", { targetId: p.id, permanent: false }));
      const banBtn = el("button", "btn tiny danger", t("kickBlockButton"));
      banBtn.addEventListener("click", () => send("kick", { targetId: p.id, permanent: true }));
      const hostBtn = el("button", "btn tiny", t("makeHostButton"));
      hostBtn.addEventListener("click", () => send("transfer_host", { targetId: p.id }));
      actions.appendChild(hostBtn);
      actions.appendChild(kickBtn);
      actions.appendChild(banBtn);
      li.appendChild(actions);
    }
    list.appendChild(li);
  }

  const startBtn = $("btn-start-game");
  if (iAmHost && !r.isRandom) {
    startBtn.classList.remove("hidden");
    startBtn.onclick = () => send("start_game");
  } else {
    startBtn.classList.add("hidden");
  }
  $("room-hint").textContent = iAmHost ? t("hostHint") : t("guestHint");

  toggleRoomChatVisibility(r);
}

// ---- room chat (friend-room waiting screen only) ----
// Reset whenever a fresh room is entered so messages from a previous room
// never bleed into a new one.
let roomChatLog = [];
let roomChatUnread = 0;
let roomChatOpenFor = null; // roomId the panel is currently showing, or null

function toggleRoomChatVisibility(r) {
  const fab = $("btn-room-chat-toggle");
  const panel = $("room-chat-panel");
  // Scoped deliberately narrow, matching the server: only non-random
  // ("friend") rooms while still in the waiting screen get chat. Random
  // matchmaking rooms skip straight to a game and have no lobby at all.
  const eligible = !r.isRandom;

  if (roomChatOpenFor !== r.roomId) {
    // Entered a different room than whatever chat state we had - reset.
    roomChatLog = [];
    roomChatUnread = 0;
    roomChatOpenFor = r.roomId;
    renderRoomChatLog();
    updateRoomChatUnreadBadge();
  }

  if (eligible) {
    fab.classList.remove("hidden");
  } else {
    fab.classList.add("hidden");
    panel.classList.add("hidden");
  }
}

function hideRoomChat() {
  $("btn-room-chat-toggle").classList.add("hidden");
  $("room-chat-panel").classList.add("hidden");
}

function renderRoomChatLog() {
  const log = $("room-chat-log");
  log.innerHTML = "";
  if (roomChatLog.length === 0) {
    log.appendChild(el("div", "room-chat-empty", t("chatEmpty")));
    return;
  }
  for (const m of roomChatLog) {
    const mine = m.playerId === myId;
    const wrap = el("div", "room-chat-msg" + (mine ? " rc-mine" : ""));
    if (!mine) {
      wrap.appendChild(el("div", "rc-name", m.nickname));
    }
    const bubble = el("span", "rc-bubble", m.text);
    wrap.appendChild(bubble);
    log.appendChild(wrap);
  }
  log.scrollTop = log.scrollHeight;
}

function updateRoomChatUnreadBadge() {
  const badge = $("room-chat-unread");
  if (roomChatUnread > 0) {
    badge.textContent = roomChatUnread > 9 ? "9+" : String(roomChatUnread);
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

function onChatMessage(msg) {
  // Only meaningful while looking at a friend room's waiting screen -
  // stray/late messages that arrive after leaving are ignored rather than
  // shown, so a delayed packet can't pop a message into the wrong room.
  if (!currentRoom || currentRoom.state !== "waiting" || currentRoom.isRandom) return;
  roomChatLog.push(msg);
  if (roomChatLog.length > 200) roomChatLog = roomChatLog.slice(-200);
  const panelOpen = !$("room-chat-panel").classList.contains("hidden");
  if (panelOpen) {
    renderRoomChatLog();
  } else if (msg.playerId !== myId) {
    roomChatUnread++;
    updateRoomChatUnreadBadge();
  }
}

$("btn-room-chat-toggle").addEventListener("click", () => {
  const panel = $("room-chat-panel");
  const opening = panel.classList.contains("hidden");
  panel.classList.toggle("hidden");
  if (opening) {
    roomChatUnread = 0;
    updateRoomChatUnreadBadge();
    renderRoomChatLog();
    $("input-room-chat").focus();
  }
});
$("btn-room-chat-close").addEventListener("click", () => {
  $("room-chat-panel").classList.add("hidden");
});

$("form-room-chat").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $("input-room-chat");
  const text = input.value.trim();
  if (!text) return;
  send("chat", { text });
  input.value = "";
});

$("btn-copy-code").addEventListener("click", () => {
  const code = $("room-code").textContent;
  navigator.clipboard?.writeText(code).then(() => toast(t("codeCopied")));
});
$("btn-leave-room").addEventListener("click", () => send("leave_room"));
$("btn-leave-game").addEventListener("click", () => send("leave_room"));

// ---- game screen ----
const FRUITS = ["strawberry", "lime", "banana", "plum"];

function fruitIcon(fruit) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", "#fruit-" + fruit);
  svg.appendChild(use);
  return svg;
}

function buildCard(card) {
  const c = el("div", "card");
  const fruits = el("div", "card-fruits");
  const n = Math.max(1, Math.min(5, card.count));
  for (let i = 0; i < n; i++) fruits.appendChild(fruitIcon(card.fruit));
  c.appendChild(fruits);
  const count = el("div", "card-count", "×" + card.count);
  c.appendChild(count);
  return c;
}

let lastEventKey = "";
let turnTimerInterval = null;

function renderGame(r) {
  const g = r.game;
  if (!g) return;

  amSpectating = !(r.players || []).some((pl) => pl.id === myId);
  $("btn-bell").classList.toggle("hidden", amSpectating);
  $("spectator-badge").classList.toggle("hidden", !amSpectating);

  $("turn-indicator").textContent = g.over
    ? t("roundOver")
    : (() => {
        const cur = g.order.find((s) => s.id === g.turnPlayerId);
        if (!cur) return "";
        return cur.id === myId ? t("yourTurn") : t("theirTurn", cur.nickname);
      })();

  updateTurnTimer(g);
  updatePotBanner(g);

  const seats = $("seats");
  seats.innerHTML = "";
  for (const seat of g.order) {
    const div = el("div", "seat");
    if (seat.id === g.turnPlayerId && !g.over) div.classList.add("turn");
    if (seat.id === myId) div.classList.add("me");
    if (seat.eliminated) div.classList.add("eliminated");

    const header = el("div", "seat-header");
    const nameLine = el("div", "seat-name", seat.nickname + (seat.id === myId ? t("youSuffix") : ""));
    if (seat.timeoutCount > 0 && !seat.eliminated) {
      nameLine.appendChild(el("span", "timeout-badge", `⏱ ${seat.timeoutCount}/3`));
    }
    header.appendChild(nameLine);
    header.appendChild(el("div", "deck-count", t("deckCount", seat.deckCount)));
    div.appendChild(header);

    const cardsWrap = el("div", "seat-cards");
    const back = el("div", "card-back", seat.deckCount > 0 ? "HalGal" : t("cardBackEmpty"));
    cardsWrap.appendChild(back);
    if (seat.topCard) {
      cardsWrap.appendChild(buildCard(seat.topCard));
    } else {
      cardsWrap.appendChild(el("div", "card-empty"));
    }
    div.appendChild(cardsWrap);
    seats.appendChild(div);
  }

  const flipBtn = $("btn-flip");
  const myTurn = !g.over && g.turnPlayerId === myId;
  flipBtn.classList.toggle("hidden", !myTurn);
  flipBtn.onclick = () => send("flip");

  handleEvent(g.event, r);

  if (g.over) {
    showGameOver(g, r);
  } else {
    $("gameover-overlay").classList.add("hidden");
  }
}

function updateTurnTimer(g) {
  clearInterval(turnTimerInterval);
  const timerEl = $("turn-timer");
  const textEl = $("turn-timer-text");
  if (g.over || !g.turnDeadline) {
    timerEl.classList.add("hidden");
    return;
  }
  timerEl.classList.remove("hidden");
  const tick = () => {
    const secsLeft = Math.max(0, Math.ceil((g.turnDeadline - Date.now()) / 1000));
    textEl.textContent = `${secsLeft}s`;
    timerEl.classList.toggle("low", secsLeft <= 5);
    if (secsLeft <= 0) clearInterval(turnTimerInterval);
  };
  tick();
  turnTimerInterval = setInterval(tick, 250);
}

function updatePotBanner(g) {
  const banner = $("pot-banner");
  if (!g.potCount) {
    banner.classList.add("hidden");
    return;
  }
  $("pot-count").textContent = g.potCount;
  banner.classList.remove("hidden");
}

function handleEvent(event, r) {
  if (!event) return;
  const key = JSON.stringify(event) + r.roomId;
  if (key === lastEventKey) return; // avoid re-logging on duplicate syncs
  lastEventKey = key;

  const nameOf = (id) => {
    const p = (r.players || []).find((pp) => pp.id === id);
    return p ? p.nickname : "?";
  };

  let line = "";
  switch (event.kind) {
    case "start":
      // Every new round - bot game, friend-room start, or a fresh random
      // match - clears the previous round's log instead of letting it pile
      // up underneath the new game's events.
      $("event-log").innerHTML = "";
      line = t("logStart");
      break;
    case "skip":
      line = t("logSkip", nameOf(event.playerId));
      break;
    case "flip":
      line = t("logFlip", nameOf(event.playerId), event.card.count, fruitName(event.card.fruit));
      break;
    case "timeout_flip":
      line = t("logTimeoutFlip", nameOf(event.playerId), event.card.count, fruitName(event.card.fruit));
      break;
    case "last_chance":
      line = t("logLastChance", nameOf(event.playerId));
      break;
    case "eliminated_no_cards":
      line = t("logEliminated", nameOf(event.playerId));
      break;
    case "disqualified":
      line = t("logDisqualified", nameOf(event.playerId));
      break;
    case "bell_correct":
      line = t("logBellCorrect", nameOf(event.playerId), event.potSize);
      toast(t("bellCorrect", nameOf(event.playerId), event.potSize), "success");
      playBellDing();
      flashBell(true);
      break;
    case "bell_wrong":
      line = event.card
        ? t("logBellWrongCard", nameOf(event.playerId), event.card.count, fruitName(event.card.fruit))
        : t("logBellWrong", nameOf(event.playerId));
      toast(t("bellWrong", nameOf(event.playerId)), "error");
      playBellThud();
      flashBell(false);
      break;
    case "bell_late":
      line = t("logBellLate", nameOf(event.playerId));
      break;
    case "game_over":
      line = t("logGameOver");
      break;
    default:
      return;
  }
  const logEl = $("event-log");
  logEl.appendChild(el("div", null, line));
  while (logEl.children.length > 40) logEl.removeChild(logEl.firstChild);
  logEl.scrollTop = logEl.scrollHeight;
}

function flashBell(correct) {
  const btn = $("btn-bell");
  btn.classList.remove("flash-correct", "flash-wrong");
  // force reflow so the animation can restart
  void btn.offsetWidth;
  btn.classList.add(correct ? "flash-correct" : "flash-wrong");
}

function showGameOver(g, r) {
  const overlay = $("gameover-overlay");
  const nameOf = (id) => {
    const p = (r.players || []).find((pp) => pp.id === id);
    return p ? p.nickname : "?";
  };
  $("gameover-title").textContent = g.winnerId ? t("gameOverWinner", nameOf(g.winnerId)) : t("gameOverNoWinner");
  const scores = $("gameover-scores");
  scores.innerHTML = "";
  const sorted = [...g.order].sort((a, b) => b.deckCount + b.faceUpCount - (a.deckCount + a.faceUpCount));
  for (const s of sorted) {
    scores.appendChild(el("li", null, t("scoreLine", s.nickname, s.deckCount + s.faceUpCount)));
  }
  // Random-match rooms are one-off pairings and can't be replayed; friend
  // rooms can go back to the lobby screen and start another round instead
  // of forcing everyone to leave (which used to delete the room).
  $("btn-play-again").classList.toggle("hidden", !!r.isRandom);
  overlay.classList.remove("hidden");
}

// ---- bell input ----
$("btn-bell").addEventListener("pointerdown", (e) => {
  if (!e.isTrusted) return;
  if (!currentRoom || currentRoom.state !== "playing") return;
  if (amSpectating) return; // read-only - also enforced server-side
  send("bell");
});
// Defense in depth: ignore any programmatic .click() call (untrusted) too.
$("btn-bell").addEventListener("click", (e) => {
  if (!e.isTrusted) e.stopImmediatePropagation();
});

// ---- PC keyboard shortcuts: Space rings the bell, Q flips ----
document.addEventListener("keydown", (e) => {
  if (!e.isTrusted) return; // same anti-macro rule as the bell button
  if (!currentRoom || currentRoom.state !== "playing") return;
  if (amSpectating) return; // read-only - also enforced server-side
  if (e.repeat) return; // ignore OS key-repeat from holding the key down
  const tag = document.activeElement?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

  if (e.code === "Space") {
    e.preventDefault(); // stop the page from scrolling
    send("bell");
  } else if (e.code === "KeyQ") {
    if (!$("btn-flip").classList.contains("hidden")) {
      e.preventDefault();
      send("flip");
    }
  }
});

$("btn-back-to-lobby").addEventListener("click", () => {
  $("gameover-overlay").classList.add("hidden");
  send("leave_room");
});
$("btn-play-again").addEventListener("click", () => {
  $("gameover-overlay").classList.add("hidden");
  send("back_to_room");
});

// ---- forms / nav ----
$("form-name").addEventListener("submit", (e) => {
  e.preventDefault();
  const raw = $("input-nickname").value.trim();
  if (!raw) return;
  pendingNickname = raw.slice(0, 16);
  connect();
});

$("btn-create-room").addEventListener("click", () => {
  $("create-name").value = "";
  $("create-public").checked = true;
  $("create-max").value = "2";
  $("modal-create").classList.remove("hidden");
});
$("btn-cancel-create").addEventListener("click", () => $("modal-create").classList.add("hidden"));
$("form-create-room").addEventListener("submit", (e) => {
  e.preventDefault();
  $("modal-create").classList.add("hidden");
  send("create_room", {
    name: $("create-name").value.trim(),
    isPublic: $("create-public").checked,
    maxPlayers: parseInt($("create-max").value, 10),
  });
});

$("form-join-code").addEventListener("submit", (e) => {
  e.preventDefault();
  const code = $("input-room-code").value.trim();
  if (!code) return;
  send("join_room", { roomId: code });
  $("input-room-code").value = "";
});

$("btn-cancel-queue").addEventListener("click", () => send("cancel_queue"));

(function buildQuickMatchButtons() {
  const wrap = $("quickmatch-buttons");
  for (let size = 2; size <= 4; size++) {
    const b = el("button", "btn small", `${size}p`);
    b.addEventListener("click", () => send("quick_match", { size }));
    wrap.appendChild(b);
  }
})();

// ---- bot mode ----
$("btn-bot").addEventListener("click", () => {
  $("modal-bot").classList.remove("hidden");
});

$("btn-cancel-bot").addEventListener("click", () => $("modal-bot").classList.add("hidden"));

$("form-bot-setup").addEventListener("submit", (e) => {
  e.preventDefault();
  const selectedDiff = document.querySelector('input[name="bot-difficulty"]:checked')?.value || "NORMAL";
  $("modal-bot").classList.add("hidden");
  send("create_bot_game", { difficulty: selectedDiff });
});

