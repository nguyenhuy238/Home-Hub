# HomeHub Design System

Locked design system for HomeHub. Storefront and admin pages defer to this
file; store owners may configure content and a bounded accent choice, not
arbitrary CSS. `tokens.css` in the future web app must remain the runtime
source of truth for these values.

## System

- Genre: editorial catalogue + practical workbench
- Storefront macrostructure: Catalogue for products; specimen detail for a product
- Admin macrostructure: Workbench with a compact side rail and data-first surfaces
- Axes: warm paper / ceramic display / restrained terracotta accent
- Product truth: imagery, specifications and contact action are more important than marketing claims

## Tokens (canonical)

```css
:root {
  --color-paper:      oklch(0.965 0.018 86);
  --color-paper-2:    oklch(0.925 0.028 82);
  --color-paper-3:    oklch(0.875 0.038 78);
  --color-ink:        oklch(0.255 0.022 72);
  --color-ink-2:      oklch(0.455 0.028 72);
  --color-rule:       oklch(0.820 0.030 78);
  --color-accent:     oklch(0.500 0.115 38);
  --color-accent-hover: oklch(0.415 0.120 36);
  --color-accent-ink: oklch(0.985 0.012 85);
  --color-success:    oklch(0.430 0.085 151);
  --color-warning:    oklch(0.585 0.120 76);
  --color-danger:     oklch(0.500 0.135 28);
  --color-focus:      oklch(0.390 0.100 218);

  --font-display: Georgia, "Times New Roman", "Noto Serif", "DejaVu Serif", serif;
  --font-body: "Segoe UI", "Noto Sans", Arial, sans-serif;
  --font-mono: "Cascadia Mono", "Segoe UI Mono", "Noto Sans Mono", monospace;

  --space-3xs: 0.25rem; --space-2xs: 0.5rem; --space-xs: 0.75rem;
  --space-sm: 1rem; --space-md: 1.5rem; --space-lg: 2rem;
  --space-xl: 3rem; --space-2xl: 4.5rem; --space-3xl: 6rem;

  --text-xs: 0.75rem; --text-sm: 0.875rem; --text-md: 1rem;
  --text-lg: 1.25rem; --text-xl: 1.75rem; --text-display: clamp(2.5rem, 7vw, 5.5rem);

  --container-max: 80rem;
  --radius-card: 0.25rem; --radius-input: 0.25rem; --radius-pill: 999px;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-fast: 150ms; --dur-base: 220ms; --dur-slow: 320ms;
}
```

## Visual and content rules

- Use a solid paper surface, hairline rules and image crops to create rhythm.
- Use the accent for primary actions, active filters and important status only.
- Keep display headings roman; use weight or color for emphasis, never italic headings.
- Use one icon family (Lucide) or no icon; do not use emoji as UI icons.
- No gradients, glass panels, decorative blobs, fake browser/phone chrome or invented metrics.
- Every store may choose one approved accent variant and upload its own mark/banner; the base tokens remain stable.
- Unknown business facts are shown as “Chưa cập nhật” or “Liên hệ”, never fabricated testimonials, counts or prices.

## Page compositions

### Storefront

- Header: store mark, short navigation and one-line contact action.
- Home: store identity block → category index → featured product catalogue → service strip → contact/footer.
- Product listing: functional heading, category/filter controls, uniform product grid; no feature-card treatment.
- Product detail: image gallery beside a specification sheet, then related products and a sticky mobile contact bar.
- Product cards show image, name, price state and one clear “Xem chi tiết” action.

### Admin

- Workbench layout: short side rail, page title, filters, primary action, table/grid and explicit feedback.
- Use dense spacing for repeated catalog work; use larger spacing only for onboarding and empty states.
- Forms are sectioned: identity → pricing → media → attributes → publication.
- Preview and publish are separate actions; publication status is always visible.

## States and responsive contract

- Interactive controls implement default, hover, focus-visible, active, disabled,
  loading, error and success states.
- Loading, empty, error and success states are required on every data surface.
- Test at 320, 375, 414 and 768 px, with no horizontal scroll.
- Primary buttons, nav links, breadcrumbs and footer links stay on one line.
- Product grids use `minmax(0, 1fr)` tracks; section headings collapse to one column on mobile.
- Respect `prefers-reduced-motion`; motion is limited to short opacity/transform feedback.

## Accessibility and SEO

- Inputs have real labels; focus rings are immediate and visible; color is never the only status signal.
- Product images require useful alt text; decorative images use empty alt text.
- Public pages render metadata from published content only and expose canonical URLs and Open Graph fields.
- Phone, Zalo and Messenger actions remain usable without JavaScript where possible.

## Agent prompt guide

- Read this file before creating or changing UI.
- Add new colors, font families or spacing values as named tokens before using them.
- Prefer real store/product copy or clearly labelled demo data.
- Keep storefront visual variety in content and imagery, not per-store CSS overrides.
