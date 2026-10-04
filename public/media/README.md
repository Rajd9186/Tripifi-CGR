# Tripifi local media library

Licensed / Tripifi-owned hero assets live here:

```
public/media/destinations/<slug>/hero.webp        # desktop hero (wide, ~1920px)
public/media/destinations/<slug>/hero-mobile.webp # mobile crop (landmark-first)
public/media/destinations/<slug>/hero.mp4         # optional ambient video (muted)
public/media/destinations/<slug>/poster.webp      # video poster fallback
```

Until licensed files ship, `src/data/media.ts` gracefully falls back to
curated destination imagery and the optional Unsplash enhancement layer.
`npm run validate:media` reports what is still missing.
