# Image slots — drop the owner's real photos here

The site is wired so the owner's photos replace the temporary stock **1:1**. Keep the same
**filename + aspect ratio** and the swap needs no code changes. Two ways to swap:

1. **Easiest:** run `bash scripts/fetch-media.sh --localize-html` once → it downloads the stock,
   makes local copies, and repoints `index.html` at `assets/img/<slot>.jpg`. After that, just
   overwrite those JPGs with the owner's photos (same filename) and you're done.
2. **Manual:** edit each `<img src>` in `index.html` to point at the new file. Keep the
   `width`/`height` attributes (they protect the layout / Lighthouse score).

## Slots, aspect ratios & subjects

| Filename | Aspect | Subject |
|---|---|---|
| `hero.jpg` | 16:10 | appetizing close-up, steam (or storefront) |
| `doner-chicken-wrap.jpg` | 4:3 | chicken döner dürüm |
| `doner-beef-plate.jpg` | 4:3 | beef döner plate |
| `doner-mixed.jpg` | 4:3 | mixed döner |
| `burger-classic.jpg` | 4:3 | classic burger |
| `burger-cheese.jpg` | 4:3 | cheeseburger |
| `burger-double.jpg` | 4:3 | double burger |
| `burger-chicken.jpg` | 4:3 | chicken burger |
| `wrap-chicken.jpg` | 4:3 | chicken wrap |
| `wrap-beef.jpg` | 4:3 | beef wrap |
| `fries.jpg` | 4:3 | fries |
| `onion-rings.jpg` | 4:3 | onion rings |
| `ayran.jpg` | 4:3 | ayran glass |
| `soft-drink.jpg` | 4:3 | cola / soft drink |
| `water.jpg` | 4:3 | water bottle |
| `gallery-grill.jpg` | 3:2 | grill in action |
| `gallery-spit.jpg` | 3:4 | döner on the spit |
| `gallery-burger.jpg` | 1:1 | burger being made |
| `gallery-taksim.jpg` | 1:1 | Taksim / İstiklal street |
| `gallery-street.jpg` | 1:1 | street-food vibe |
| `gallery-guests.jpg` | 3:2 | happy customers |

## 📸 Owner phone shot list (12 shots — best result)

Shoot in landscape, good light, steady hands. The grittier-but-real shots of *this* storefront
help tourists recognize you from the street.

1. Döner spit turning (close, with the glow)
2. Knife shaving the meat
3. Wrapping a dürüm
4. Burger flip with flame on the grill
5. Fries straight out of the fryer
6. Ayran / drinks on the counter
7. A full loaded plate / tray
8. Storefront in daylight (with the sign)
9. Storefront lit up at night
10. A happy customer holding food (with permission)
11. The team behind the counter
12. The queue / busy moment

For the **hero video**: a 20–30s clip of the spit turning or a burger sizzling. Drop it at
`scripts/hero-raw.mp4` and run `bash scripts/fetch-media.sh` to trim + encode it.
