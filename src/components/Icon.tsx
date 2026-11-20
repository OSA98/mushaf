import type { SVGProps } from 'react'

// Stroke icon set (24×24, 1.5px) in the style of the Hugeicons used in the Figma file.
const P: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  bookOpen: 'M12 6.5C10 5 7.5 4.5 3 4.5v14c4.5 0 7 .5 9 2 2-1.5 4.5-2 9-2v-14c-4.5 0-7 .5-9 2zm0 0v14',
  book: 'M4 19V5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h13M8 7h7M8 11h5',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm10 2-4.35-4.35',
  library: 'M4 20V5M8 20V5M12 20V9M12 9l3-5 5 15M3 20h18',
  bookmark: 'M6 3h12v18l-6-4-6 4z',
  bookmarkFill: 'M6 3h12v18l-6-4-6 4z',
  bookmarkAdd: 'M6 3h12v18l-6-4-6 4zM12 7v6M9 10h6',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.4-3a7.4 7.4 0 0 0-.1-1.3l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-2.2-1.3L14.4 3h-4l-.4 2.4a7.6 7.6 0 0 0-2.2 1.3l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.6l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 0 0 2.2 1.3l.4 2.4h4l.4-2.4a7.6 7.6 0 0 0 2.2-1.3l2.4 1 2-3.4-2-1.6c.1-.4.1-.9.1-1.3z',
  menu: 'M4 6h16M4 12h16M4 18h16',
  play: 'M7 4.5v15l13-7.5z',
  pause: 'M8 5v14M16 5v14',
  next: 'M5 5v14l10-7zM19 5v14',
  prev: 'M19 5v14L9 12zM5 5v14',
  back5: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',
  fwd5: 'M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5',
  repeat: 'M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3',
  volume: 'M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14',
  share: 'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4',
  note: 'M4 4h16v12H8l-4 4zM8 8h8M8 12h5',
  edit: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  close: 'M6 6l12 12M18 6 6 18',
  chevronDown: 'M6 9l6 6 6-6',
  chevronLeft: 'M15 6l-6 6 6 6',
  chevronRight: 'M9 6l6 6-6 6',
  radio: 'M3 9h18v11H3zM7 5l10-3M8 15a2 2 0 1 0 0-.01M15 13h3M15 16h3',
  voice: 'M12 3v18M8 7v10M4 10v4M16 7v10M20 10v4',
  translate: 'M3 5h9M7.5 3v2M5 9c1.5 3 4 5 6 6M10 5c-.5 4-3 7-6 9M13 21l4-9 4 9M14.5 18h5',
  download: 'M12 3v12m0 0-5-5m5 5 5-5M4 17v3h16v-3',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  moon: 'M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9S14.5 18.5 12 21c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  fire: 'M12 22c4 0 7-2.7 7-6.5 0-4-3-6-4-9.5-1.5 1.5-2 3-2 4.5C11 9 9.5 6 10 2 6.5 4.5 5 9 5 15.5 5 19.3 8 22 12 22zm0 0c-1.7 0-3-1.2-3-2.8 0-2 1.5-3 3-4.7 1.5 1.7 3 2.7 3 4.7 0 1.6-1.3 2.8-3 2.8z',
  calendar: 'M4 6h16v15H4zM4 10h16M8 3v4M16 3v4M8 14h2M14 14h2M8 17h2',
  check: 'M5 12l5 5L20 7',
  checkCircle: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12l3 3 5-6',
  plus: 'M12 5v14M5 12h14',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
  layers: 'M12 3 2 8l10 5 10-5zM2 13l10 5 10-5',
  eyeOff: 'M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 9 5 10 7a17 17 0 0 1-3.2 4M6.6 6.6C4.3 8 2.8 10.3 2 12c1 2 5 7 10 7 1.6 0 3-.4 4.3-1',
  eye: 'M2 12c1-2 5-7 10-7s9 5 10 7c-1 2-5 7-10 7S3 14 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  userSearch: 'M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM3 21c0-3.5 3-6 7-6M17.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM21 22l-1.7-1.7',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  location: 'M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01',
  highlighter: 'M9 15l-4 4h6l1-1M9 15l6-6 4 4-6 6zM15 9l3-3 4 4-3 3',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  columns: 'M3 4h18v16H3zM12 4v16',
  square: 'M5 4h14v16H5z',
  mosque: 'M12 3c-3 2-6 4-6 8v9h12v-9c0-4-3-6-6-8zM3 20h18M10 20v-4a2 2 0 0 1 4 0v4M4 11v9M20 11v9',
  task: 'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
  apple: 'M16.5 3c0 1.5-1 3-2.8 3.2C13.6 4.6 14.9 3.2 16.5 3zM19 16.6c-.6 1.3-.9 1.9-1.7 3-1.1 1.6-2.1 2.4-3.1 2.4-.9 0-1.4-.6-2.7-.6s-1.8.6-2.7.6c-1.1 0-2.1-1-3.2-2.5C3.4 16.6 3.1 12.6 4.6 10.4c1-1.6 2.6-2.5 4.2-2.5 1.3 0 2.2.7 3.3.7 1.1 0 1.8-.7 3.3-.7 1.4 0 2.8.7 3.7 2-3.2 1.8-2.7 6.4-.1 6.7z',
  android: 'M5 10v6M19 10v6M7 9h10v8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1zM9 18v3M15 18v3M7 9a5 5 0 0 1 10 0M8 4l1.5 2M16 4l-1.5 2',
  monitor: 'M3 4h18v12H3zM8 20h8M12 16v4',
}

export type IconName = keyof typeof P

export function Icon({ name, size = 24, fill, ...rest }: { name: IconName; size?: number; fill?: boolean } & SVGProps<SVGSVGElement>) {
  const filled = fill || name === 'bookmarkFill' || name === 'play'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <path d={P[name]} />
    </svg>
  )
}
