---
name: Liquid Glass
colors:
  surface: '#eefcfd'
  surface-dim: '#cfddde'
  surface-bright: '#eefcfd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e8f6f7'
  surface-container: '#e3f1f2'
  surface-container-high: '#ddebec'
  surface-container-highest: '#d7e5e6'
  on-surface: '#111e1f'
  on-surface-variant: '#3e4851'
  inverse-surface: '#263334'
  inverse-on-surface: '#e5f3f4'
  outline: '#6f7882'
  outline-variant: '#bec8d2'
  surface-tint: '#006494'
  primary: '#006494'
  on-primary: '#ffffff'
  primary-container: '#3ab5ff'
  on-primary-container: '#004466'
  inverse-primary: '#8ecdff'
  secondary: '#00696e'
  on-secondary: '#ffffff'
  secondary-container: '#80f1f9'
  on-secondary-container: '#006e73'
  tertiary: '#286769'
  on-tertiary: '#ffffff'
  tertiary-container: '#7ab6b8'
  on-tertiary-container: '#00484a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cbe6ff'
  primary-fixed-dim: '#8ecdff'
  on-primary-fixed: '#001e30'
  on-primary-fixed-variant: '#004b71'
  secondary-fixed: '#83f4fc'
  secondary-fixed-dim: '#64d7df'
  on-secondary-fixed: '#002022'
  on-secondary-fixed-variant: '#004f53'
  tertiary-fixed: '#b0edef'
  tertiary-fixed-dim: '#94d1d3'
  on-tertiary-fixed: '#002021'
  on-tertiary-fixed-variant: '#034f51'
  background: '#eefcfd'
  on-background: '#111e1f'
  surface-variant: '#d7e5e6'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 16px
  container-max: 1280px
---

## Brand & Style

This design system is defined by a **Glassmorphism** aesthetic, emphasizing clarity, depth, and fluid motion. It is designed to feel ethereal and lightweight yet structurally sound. The target experience is one of immersion and tranquility, suitable for high-end SaaS or productivity tools that prioritize focus.

The visual language uses frosted glass textures, vibrant background blurs, and translucent layers to create a sense of verticality. Interaction is marked by subtle transitions in opacity and blur intensity, making the interface feel reactive and alive.

## Colors

The palette is derived from a spectrum of icy, crystalline blues. 

- **Primary (#3AB5FF):** Reserved for high-impact actions, active states, and brand-critical navigation elements.
- **Secondary (#86F7FF):** Used for supporting UI elements, accents within glass containers, and interactive hover states.
- **Surface & Backgrounds (#F0FEFF & #BFFDFF):** These ultra-light tints form the base of the "glass" surfaces. They are applied with varying degrees of transparency (10% to 60%) to create the frosted effect.
- **Text & Contrast:** Deep navy or high-contrast slate is used for legibility against the luminous blue backgrounds, ensuring accessibility standards are met.

## Typography

This design system utilizes **Inter** exclusively to maintain a systematic and utilitarian feel that balances the highly expressive glass aesthetics. 

Typography should be treated as the "anchor" of the design. While the background elements are fluid and translucent, the text must remain crisp and grounded. Use slightly tighter letter spacing for large headlines to maintain a modern, "tight" editorial feel. High-contrast ink colors are mandatory for all body and label text to ensure readability through transparent layers.

## Layout & Spacing

The layout follows a **fluid grid** model with generous margins to allow the background blurs to "breathe" around the content containers.

- **Desktop:** 12-column grid with 24px gutters. Content is centered in a max-width container.
- **Tablet:** 8-column grid with 20px gutters.
- **Mobile:** 4-column grid with 16px gutters and 16px side margins.

Spacing follows a 4px base unit. Component internal padding should be generous (typically 16px or 24px) to reinforce the airy, premium feel of the glass surfaces.

## Elevation & Depth

Hierarchy is established through **Backdrop Blurs** and **Tonal Translucency** rather than traditional drop shadows.

- **Level 1 (Base):** Solid background or a very subtle gradient of the neutral tint.
- **Level 2 (Cards/Content):** Background blur (20px-32px) with a 40% white/neutral fill. A 1px semi-transparent white border ("inner glow") defines the edges.
- **Level 3 (Modals/Popovers):** Background blur (40px+) with a 60% fill. Subtle, extra-diffused ambient shadows with a light blue tint (#3AB5FF at 10% opacity) may be used to separate these elements from Level 2.

## Shapes

The shape language is consistently **Pill-shaped**. 

The 1rem base radius ensures that elements feel approachable, soft, and extremely modern, mimicking the fluid properties of liquid. Larger containers like main content cards should use `rounded-xl` (3rem) to emphasize the soft, "bubble" nature of the glass containers. This high degree of rounding reinforces the playful yet premium liquid aesthetic.

## Components

- **Buttons:** Primary buttons use a solid fill of the primary blue with white text. Secondary buttons use a glass fill with a 1px primary-colored border.
- **Input Fields:** Backgrounds are slightly more opaque than the cards they sit on to indicate interactivity. Use a 2px primary blue border on focus.
- **Chips:** Highly rounded (pill-shaped) with a 20% opacity primary fill and dark blue text.
- **Cards:** The core of the system. Every card must have a backdrop-filter (blur) and a subtle 1px top-left "highlight" border to simulate light hitting glass.
- **Glass Sliders:** Tracks use the secondary light blue at low opacity, while the thumb is a solid primary blue circle.