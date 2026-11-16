export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  description: string;
}

export interface ExperiencePhoto {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
  handle: string;
}

// Deni Avdija highlights — 4 real YouTube videos
export const deniAvdijaVideos: YouTubeVideo[] = [
  {
    id: 'deni-1',
    title: "Deni Avdija BEST HIGHLIGHTS 24-25 Season",
    thumbnail: 'https://img.youtube.com/vi/Q-1LtnqL5PM/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=Q-1LtnqL5PM',
    description: 'The best of Deni Avdija from the 2024-2025 season with the Portland Trail Blazers.',
  },
  {
    id: 'deni-2',
    title: "Deni Avdija Highlights (Season-High 37 PTS) | Trail Blazers vs Bulls",
    thumbnail: 'https://img.youtube.com/vi/zmu9tZsPOg0/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=zmu9tZsPOg0',
    description: 'Season-high 37 points — April 4, 2025. Trail Blazers 113, Bulls 118.',
  },
  {
    id: 'deni-3',
    title: "Deni Avdija Did It ALL This Season | Top Plays | 2025-26 NBA Season",
    thumbnail: 'https://img.youtube.com/vi/gC6KU0sb0Bo/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=gC6KU0sb0Bo',
    description: 'Deni Avdija took his game to another level — a true two-way force in the 2025-26 season.',
  },
  {
    id: 'deni-4',
    title: "Deni Avdija Highlights (24 PTS, 5 REB) | Trail Blazers vs Jazz | Oct. 31, 2026",
    thumbnail: 'https://img.youtube.com/vi/jUM9sqRShcA/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=jUM9sqRShcA',
    description: 'Deni leads all scorers with 24 points in a Halloween win over the Jazz.',
  },
];

// Deni Avdija info
export const deniAvdijaInfo = {
  fullName: 'Deni Avdija',
  team: 'Portland Trail Blazers',
  position: 'Small Forward',
  height: '6-8 (203cm)',
  weight: '228 lb (103kg)',
  born: 'January 3, 2001 — Beit Zera, Israel',
  draft: 'Washington Wizards, 1st round (9th pick, 2020)',
  nbaDebut: 'December 23, 2020',
  experience: '7 years',
  instagram: '@deniavdia8',
  nickname: 'Turbo',
  espnAthleteId: 4683021,
};

// NBA Weekly highlights — 4 verified videos
export const nbaWeeklyVideos: YouTubeVideo[] = [
  {
    id: 'nba-w5',
    title: "The BEST MOMENTS of Week 5 | 2025-26 NBA Season",
    thumbnail: 'https://img.youtube.com/vi/46_vHOCZ1q8/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=46_vHOCZ1q8',
    description: 'Check out the best moments of Week 5 of the 2025-26 NBA Season!',
  },
  {
    id: 'nba-w3',
    title: "The BEST MOMENTS of Week 3 | 2025-26 NBA Season",
    thumbnail: 'https://img.youtube.com/vi/toTra6Q79l0/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=toTra6Q79l0',
    description: 'Luka continued his historic scoring start, Giannis called game in Indiana, and Josh Giddey joined Michael Jordan in Bulls history.',
  },
  {
    id: 'nba-clutch',
    title: "The Best CLUTCH Plays & GAME-WINNERS of the 2025-26 NBA Season",
    thumbnail: 'https://img.youtube.com/vi/6XmWPHW9b1A/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=6XmWPHW9b1A',
    description: 'The most clutch plays and game-winning shots of the entire 2025-26 season.',
  },
  {
    id: 'nba-top100',
    title: "Top 100 Plays of the 2026 NBA Season",
    thumbnail: 'https://img.youtube.com/vi/PFxWeiRTfSk/maxresdefault.jpg',
    url: 'https://www.youtube.com/watch?v=PFxWeiRTfSk',
    description: 'The top 100 plays from the entire 2025-26 NBA regular season and playoffs.',
  },
];

// Travel photos from Thailand
export const experiencePhotos: ExperiencePhoto[] = [
  {
    id: 'thailand-1',
    title: 'Thailand with my girlfriend Ilay',
    description: 'Photos of my girlfriend Ilay and me from our trip to Thailand last summer.',
    imageUrl: '/images/thailand/IMG_8126.jpg',
    category: 'Thailand',
  },
  {
    id: 'thailand-2',
    title: 'Thailand with my girlfriend Ilay',
    description: 'Photos of my girlfriend Ilay and me from our trip to Thailand last summer.',
    imageUrl: '/images/screenshots/Screenshot_2026-11-14_at_19.21.33.png',
    category: 'Thailand',
  },
  {
    id: 'thailand-3',
    title: 'Thailand with my girlfriend Ilay',
    description: 'Photos of my girlfriend Ilay and me from our trip to Thailand last summer.',
    imageUrl: '/images/thailand/101.JPEG',
    category: 'Thailand',
  },
  {
    id: 'thailand-4',
    title: 'Thailand with my girlfriend Ilay',
    description: 'Photos of my girlfriend Ilay and me from our trip to Thailand last summer.',
    imageUrl: '/images/thailand/125.JPEG',
    category: 'Thailand',
  },
  {
    id: 'thailand-5',
    title: 'Thailand with my girlfriend Ilay',
    description: 'Photos of my girlfriend Ilay and me from our trip to Thailand last summer.',
    imageUrl: '/images/281.JPEG',
    category: 'Thailand',
  },
  {
    id: 'thailand-6',
    title: 'Thailand with my girlfriend Ilay',
    description: 'Photos of my girlfriend Ilay and me from our trip to Thailand last summer.',
    imageUrl: '/images/לפרופיל/GPTempDownload.JPG',
    category: 'Thailand',
  },
];

export const socialLinks: SocialLink[] = [
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/roy-ben-hur-00783133b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app', icon: 'linkedin', handle: 'Roy Ben Hur' },
  { name: 'GitHub', url: 'https://github.com/roybenhur', icon: 'github', handle: 'roybenhur' },
  { name: 'Email', url: 'mailto:roy.benhur23@gmail.com', icon: 'mail', handle: 'roy.benhur23@gmail.com' },
];

// Personal info — Roy Ben Hur
export const personalInfo = {
  name: 'Roy Ben Hur',
  tagline: 'Electrical Engineering Student · Formal Verification @ Intel · Basketball Enthusiast',
  bio: "I'm a 4th-year Electrical Engineering student at the Technion, currently working in Formal Verification at Intel. My world lives at the intersection of logic design and digital systems- where every signal has meaning and every gate tells a story.",
  location: 'Haifa, Israel',
  photo: '/images/לפרופיל.JPG',
  resumeUrl: '',
};

// Quick stats
export const quickStats = [
  { label: 'Year of Study', value: '4th', icon: 'calendar' },
  { label: 'Logic Gates Verified', value: '∞', icon: 'code' },
  { label: 'Games Watched', value: '500+', icon: 'trophy' },
  { label: 'Coffee Consumed', value: '∞', icon: 'coffee' },
];

// Skills/interests
export const skills = [
  { name: 'Formal Verification', level: 90 },
  { name: 'Digital Design (SystemVerilog)', level: 85 },
  { name: 'Electrical Engineering', level: 88 },
  { name: 'React & TypeScript', level: 75 },
  { name: 'Basketball Analysis', level: 95 },
  { name: 'Content Creation', level: 70 },
];
