// Мок-данные для дизайна. Курсы — заглушки, на бэке заменим живыми.

export const CRYPTO = [
  { id: 'usdt', code: 'USDT', name: 'Tether',   net: 'TRC-20', netName: 'TRON',     eta: '~3 мин',  conf: 19, rate: 91.84,     dp: 2, ch24: '+0,08%', glyph: 'g-usdt', c1: '#43D1A5', c2: '#0E5546', pat: '#04372B', tag: '0%',      addr: 'TQ7mVb4kY2nP8xR1sLc9Hd3FwJ6eZu5AqX' },
  { id: 'btc',  code: 'BTC',  name: 'Bitcoin',  net: 'BTC',    netName: 'Bitcoin',  eta: '~20 мин', conf: 2,  rate: 8942300,   dp: 6, ch24: '+1,92%', glyph: 'g-btc',  c1: '#F5A94C', c2: '#7C3F0D', pat: '#4A2304', tag: 'хит',     addr: 'bc1q8d4w9k2m7xz5qyl3p0rj6vh2t8sne4fucw' },
  { id: 'ton',  code: 'TON',  name: 'Toncoin',  net: 'TON',    netName: 'TON',      eta: '~1 мин',  conf: 1,  rate: 264.5,     dp: 2, ch24: '−0,64%', glyph: 'g-ton',  c1: '#55B5FF', c2: '#123E7A', pat: '#07244B', tag: 'быстро',  addr: 'UQBv3kZ9xq2N7mLp4HsY8dWc1tRf6eJa0uGiK5oPn2Vb' },
  { id: 'eth',  code: 'ETH',  name: 'Ethereum', net: 'ERC-20', netName: 'Ethereum', eta: '~5 мин',  conf: 12, rate: 312400,    dp: 5, ch24: '+0,87%', glyph: 'g-eth',  c1: '#9DA7FF', c2: '#30368A', pat: '#1A1D58', tag: null,      addr: '0x7a3F9c21B84e0D5f6A1c9E3b72D4f08C1e6B9a54' },
  { id: 'sol',  code: 'SOL',  name: 'Solana',   net: 'SOL',    netName: 'Solana',   eta: '~1 мин',  conf: 1,  rate: 16250,     dp: 3, ch24: '+3,15%', glyph: 'g-sol',  c1: '#CE8BFF', c2: '#4C2185', pat: '#2B0E53', tag: null,      addr: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' },
  { id: 'trx',  code: 'TRX',  name: 'TRON',     net: 'TRC-20', netName: 'TRON',     eta: '~3 мин',  conf: 19, rate: 26.4,      dp: 1, ch24: '−0,21%', glyph: 'g-trx',  c1: '#FF8383', c2: '#7A1B2A', pat: '#480B16', tag: null,      addr: 'TJRabPrwbZy45sbavfcjinPJC18kjpRTv8' },
];

export const METHODS = [
  { id: 'sbp',  name: 'СБП',      sub: 'любой банк',   eta: 'до 5 мин',  icon: 'i-bolt', destLabel: 'Телефон для СБП',  placeholder: '+7 900 000-00-00' },
  { id: 'card', name: 'Карта',    sub: 'Мир',          eta: 'до 15 мин', icon: 'i-card', destLabel: 'Номер карты',      placeholder: '2200 0000 0000 0000' },
  { id: 'cash', name: 'Наличные', sub: 'Москва-Сити',  eta: 'по записи', icon: 'i-cash', destLabel: 'Когда удобно',     placeholder: 'сегодня после 18:00' },
];

export const HISTORY = [
  { day: 'Сегодня', items: [
    { c: 'ton',  dir: 'buy',  give: 25000, get: 93.6,   time: '11:05', via: 'СБП',   status: 'pending' },
    { c: 'usdt', dir: 'sell', give: 1500,  get: 136530, time: '09:32', via: 'СБП',   status: 'done' },
  ]},
  { day: 'Вчера', items: [
    { c: 'btc',  dir: 'sell', give: 0.012, get: 106180, time: '22:47', via: 'Карта', status: 'done' },
  ]},
  { day: '8 ноября', items: [
    { c: 'usdt', dir: 'buy',  give: 50000, get: 538.2,  time: '18:20', via: 'СБП',   status: 'done' },
    { c: 'eth',  dir: 'sell', give: 0.4,   get: 123900, time: '13:04', via: 'СБП',   status: 'done' },
    { c: 'sol',  dir: 'sell', give: 3,     get: 48320,  time: '10:41', via: 'Карта', status: 'done' },
  ]},
];

// реплики маскота
export const QUIPS = {
  hello: ['Чё меняем?', 'Заходи, курс свежий', 'Меняла на месте'],
  low:   ['Меньше пятёры не мараюсь', 'Мелочь не беру, бро', 'Докинь до 5 000 ₽'],
  high:  ['Три ляма за раз — потолок', 'Столько разом не унесу'],
  big:   ['Опа, крупняк. Уважаю', 'Вот это разговор', 'Серьёзно. Сделаем чисто'],
  swap:  ['Разворот. Без базара', 'Теперь в обратку', 'Перекинул'],
  poke:  ['Чё надо?', 'Руки убрал', 'Я при исполнении', 'Ещё раз — и курс подниму'],
  rate:  ['Курс обновил', 'Свежий курс, держу минуту'],
  coin:  { usdt: 'USDT — база', btc: 'Битку беру без вопросов', ton: 'TON — быстро и по-нашему', eth: 'Эфир? Солидно', sol: 'Солана летает', trx: 'TRX — дёшево и сердито' },
  done:  ['Чисто сработали', 'Ещё по одной?', 'Приходи ещё, бро'],
};
