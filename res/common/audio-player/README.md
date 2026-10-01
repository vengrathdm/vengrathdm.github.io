# Audio Player

Inputs:
- src: required MP3 URL
- color: optional accent/hover color
- continuationKey: optional sessionStorage namespace

Everything else is fixed.

Current Legends of Barovia reference:
- src: ./into-the-mists.mp3
- color: #8b2020
- continuationKey: baroviaTheme
- volume: 0.55
- desktop: 64px, right 24px, bottom 24px
- mobile: 58px, right 16px, bottom 16px
- border: 2px solid rgba(241,241,238,.9)
- background: rgba(26,23,20,.88)
- icon: #f5f4ef

When continuationKey exists, timestamp/muted/playing state persists across pages using that same key.