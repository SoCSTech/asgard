/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  prefix: "",
  theme: {
    screens: {
      tablet: '640px',
      laptop: '1024px',
      desktop: '1280px',
      ultra: '3000px'
    },
    container: {
      center: true,
      padding: "2rem",
    },
    extend: {
      colors: {
        // SoCS Colours (edit in index.css)
        apricot: "hsl(var(--apricot))",
        lavender: "hsl(var(--lavender))",
        salmon: "hsl(var(--salmon))",
        cyan: "hsl(var(--cyan))",
        mint: "hsl(var(--mint))",
        sky: "hsl(var(--sky))",
        blush: "hsl(var(--blush))",
        turquoise: "hsl(var(--turquoise))",
        chartreuse: "hsl(var(--chartreuse))",
        periwinkle: "hsl(var(--periwinkle))",
        coral: "hsl(var(--coral))",
        lilac: "hsl(var(--lilac))",
        frost: "hsl(var(--frost))",
        slate: "hsl(var(--slate))",
        tangerine: "hsl(var(--tangerine))",
        white: "hsl(var(--white))",
        black: "hsl(var(--black))",
        azure: "hsl(var(--azure))",
        mango: "hsl(var(--mango))",
        violet: "hsl(var(--violet))",
        emerald: "hsl(var(--emerald))",
        amber: "hsl(var(--amber))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}