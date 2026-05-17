const adjectives = [
  'Silent', 'Blue', 'Red', 'Wild', 'Dark',
  'Swift', 'Brave', 'Calm', 'Faint', 'Sharp',
];

const animals = [
  'Tiger', 'Fox', 'Wolf', 'Eagle', 'Shark',
  'Panda', 'Lynx', 'Bear', 'Hawk', 'Viper',
];

export function generateUsername(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const num = Math.floor(Math.random() * 90) + 10; // 10–99
  return `${adj}${animal}${num}`;
}

const AVATAR_COLORS = [
  '#FF4D00', '#FF6B2B', '#FF2D55', '#AF52DE',
  '#5856D6', '#007AFF', '#34C759', '#FF9500',
  '#00C7BE', '#FF375F',
];

export function generateAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}
