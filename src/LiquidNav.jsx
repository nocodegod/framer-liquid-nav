import { useEffect, useId } from "react"
import { addPropertyControls, ControlType } from "framer"

// ============================================
// LiquidNav — pill-shaped liquid-glass navigation with optional metallic CTA.
//
// Replicates the lightsite.studio top navigation 1:1: four text links
// (Satoshi 500, 16px, grey) + a three-layer metallic "Book a call" pill
// (Inter 500, polished-steel bevel, soft drop shadow). Replaces the solid
// rgb(18,18,18) Framer pill with the original LiquidNav glass body:
// backdrop-filter (brightness + blur + SVG displacement + SVG chromatic).
//
// Also drives the solcard.cc nav (smaller link set, no CTA) — set
// showCta=false in Framer for that tenant.
// ============================================

const SATOSHI_HREF =
    "https://api.fontshare.com/v2/css?f%5B%5D=satoshi@500,700,400&display=swap"
const INTER_HREF =
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
const GEIST_HREF =
    "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&display=swap"

function useExternalFont(href, dataAttr, enabled) {
    useEffect(() => {
        if (!enabled) return
        if (typeof document === "undefined") return
        if (document.querySelector(`link[${dataAttr}]`)) return
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = href
        link.setAttribute(dataAttr, "")
        document.head.appendChild(link)
    }, [enabled])
}

export default function LiquidNav({
    // — Content (6 flat slots, items 1–4 visible by default) —
    item1Visible = true,
    item1Label = "Home",
    item1Href = "./",
    item2Visible = true,
    item2Label = "About us",
    item2Href = "./about-us",
    item3Visible = true,
    item3Label = "Designs",
    item3Href = "./Our-Work",
    item4Visible = true,
    item4Label = "Prices",
    item4Href = "./Pricing",
    item5Visible = false,
    item5Label = "Blog",
    item5Href = "./blog",
    item6Visible = false,
    item6Label = "Contact",
    item6Href = "./contact",
    showCta = true,
    ctaLabel = "Book a call",
    ctaHref = "./leadgen-form-free-website-done-offer",

    // — Fonts —
    fontFamily = '"Satoshi", "Satoshi Placeholder", ui-sans-serif, system-ui, -apple-system, sans-serif',
    ctaFontFamily = '"Inter", "Inter Placeholder", ui-sans-serif, system-ui, -apple-system, sans-serif',
    loadSatoshiFont = true,
    loadInterFont = true,
    loadGeistFont = false,

    // — Liquid-glass body —
    blurAmount = 4,
    brightness = 1.1,
    chromaticOffset = 2,
    displacementScale = 200,
    glassBorderColor = "rgba(255, 255, 255, 0.125)",
    cardColor = "rgba(20, 18, 30, 1)",

    // — Pill layout —
    pillPadding = 5,
    pillGap = 10,
    pillBorderRadius = 80,

    // — Link styling —
    linkColor = "rgb(145, 145, 145)",
    linkColorHover = "rgba(247, 245, 252, 1)",
    linkPaddingX = 20,
    linkPaddingY = 10,
    linkBorderRadius = 40,
    linkFontSize = 16,
    linkFontWeight = 500,
    linkLineHeight = 19.2,
    linkLetterSpacing = 0,
    transitionMs = 150,

    // — Metallic CTA —
    ctaHeight = 50,
    ctaPaddingX = 20,
    ctaTextColor = "rgb(186, 190, 194)",
    ctaTextColorHover = "rgba(255, 255, 255, 1)",
    ctaFontSize = 16,
    ctaFontWeight = 500,
    ctaLineHeight = 19.2,
    ctaLetterSpacingEm = -0.01,
    ctaFrameColorTop = "rgb(31, 31, 31)",
    ctaFrameColorBottom = "rgb(0, 0, 0)",
    ctaBevelColor1 = "rgb(227, 227, 227)",
    ctaBevelColor2 = "rgb(112, 112, 112)",
    ctaBevelColor3 = "rgb(59, 59, 59)",
    ctaBevelColor4 = "rgb(18, 18, 18)",
    ctaBevelColor5 = "rgb(51, 51, 51)",
    ctaBevelColor6 = "rgb(102, 102, 102)",
    ctaCapColor1 = "rgb(71, 77, 80)",
    ctaCapColor2 = "rgb(39, 43, 45)",
    ctaCapColor3 = "rgb(30, 32, 33)",
    ctaCapColor4 = "rgb(19, 20, 21)",
    ctaShadowColor = "rgba(0, 0, 0, 0.3)",
    ctaShadowY = 5,
    ctaShadowBlur = 10,
    ctaShadowSpread = 5,
    ctaInnerHighlight = "rgba(255, 255, 255, 0.2)",
}) {
    useExternalFont(SATOSHI_HREF, "data-liquidnav-satoshi", loadSatoshiFont)
    useExternalFont(INTER_HREF, "data-liquidnav-inter", loadInterFont)
    useExternalFont(GEIST_HREF, "data-liquidnav-geist", loadGeistFont)

    // Per-instance stable IDs so multiple pills on a page don't collide on
    // SVG filter `url(#id)` references or scoped CSS class names.
    const rawId = useId()
    const safeId = "ln" + rawId.replace(/[^a-zA-Z0-9]/g, "")
    const dispFilterId = safeId + "_disp"
    const chromaFilterId = safeId + "_chroma"
    const pillClass = safeId + "_pill"
    const linkClass = safeId + "_link"
    const ctaTextClass = safeId + "_ctatxt"

    // Metallic CTA gradients — stops mirror the live lightsite.studio Framer
    // computed-style snapshot. Bevel stops are asymmetric on purpose:
    // bright→mid→dark→darkest→mid→mid simulates light grazing a curved rim.
    const frameGradient = `linear-gradient(${ctaFrameColorTop} 0%, ${ctaFrameColorBottom} 100%)`
    const bevelGradient = `linear-gradient(${ctaBevelColor1} 0%, ${ctaBevelColor2} 17%, ${ctaBevelColor3} 33%, ${ctaBevelColor4} 58.5462%, ${ctaBevelColor5} 87.8378%, ${ctaBevelColor6} 100%)`
    const capGradient = `linear-gradient(${ctaCapColor1} 0%, ${ctaCapColor2} 42%, ${ctaCapColor3} 74%, ${ctaCapColor4} 100%)`

    const css = `
.${pillClass} {
    backdrop-filter: brightness(${brightness}) blur(${blurAmount}px) url(#${dispFilterId}) url(#${chromaFilterId});
    -webkit-backdrop-filter: brightness(${brightness}) blur(${blurAmount}px);
}
.${linkClass} { color: ${linkColor}; transition: color ${transitionMs}ms ease; }
.${linkClass}:hover { color: ${linkColorHover}; }
.${ctaTextClass} { color: ${ctaTextColor}; transition: color ${transitionMs}ms ease; }
.${pillClass} a:hover .${ctaTextClass} { color: ${ctaTextColorHover}; }
`.trim()

    const pillStyle = {
        position: "relative",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "fit-content",
        height: "fit-content",
        padding: pillPadding,
        gap: pillGap,
        borderRadius: pillBorderRadius,
        overflow: "hidden",
        borderTop: 0,
        borderBottom: 0,
        borderLeft: `1px solid ${glassBorderColor}`,
        borderRight: `1px solid ${glassBorderColor}`,
        background: `linear-gradient(to bottom, ${cardColor} 0%, rgba(255,255,255,0) 100%)`,
        fontFamily,
    }

    const linkStyle = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: `${linkPaddingY}px ${linkPaddingX}px`,
        borderRadius: linkBorderRadius,
        fontFamily,
        fontSize: linkFontSize,
        lineHeight: `${linkLineHeight}px`,
        fontWeight: linkFontWeight,
        letterSpacing: `${linkLetterSpacing}em`,
        textDecoration: "none",
        backgroundColor: "transparent",
        whiteSpace: "nowrap",
    }

    // — Metallic CTA three-layer style (Frame → Bevel → Cap → Text) —
    const ctaOuterStyle = {
        position: "relative",
        display: "inline-flex",
        alignItems: "stretch",
        justifyContent: "center",
        height: ctaHeight,
        padding: 1,
        borderRadius: 1000,
        background: frameGradient,
        boxShadow: `0 ${ctaShadowY}px ${ctaShadowBlur}px ${ctaShadowSpread}px ${ctaShadowColor}`,
        textDecoration: "none",
        boxSizing: "border-box",
    }
    const ctaBevelStyle = {
        display: "inline-flex",
        alignItems: "stretch",
        justifyContent: "center",
        flex: "1 1 auto",
        padding: 2,
        borderRadius: 100,
        background: bevelGradient,
        boxSizing: "border-box",
    }
    const ctaCapStyle = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "1 1 auto",
        padding: `0 ${ctaPaddingX}px`,
        borderRadius: 1000,
        background: capGradient,
        boxShadow: `inset 0 -1px 0 0 ${ctaInnerHighlight}`,
        boxSizing: "border-box",
    }
    const ctaTextStyle = {
        fontFamily: ctaFontFamily,
        fontSize: ctaFontSize,
        fontWeight: ctaFontWeight,
        lineHeight: `${ctaLineHeight}px`,
        letterSpacing: `${ctaLetterSpacingEm}em`,
        whiteSpace: "nowrap",
    }

    return (
        <div className={pillClass} data-fluid-bg="1" style={pillStyle}>
            <style>{css}</style>

            {/* SVG filter defs — per-instance IDs, hidden from layout */}
            <svg
                aria-hidden="true"
                style={{
                    position: "absolute",
                    width: 0,
                    height: 0,
                    overflow: "hidden",
                    pointerEvents: "none",
                }}
            >
                <defs>
                    <filter id={dispFilterId}>
                        <feTurbulence
                            baseFrequency="0.0001"
                            result="turbulence"
                            type="turbulence"
                        />
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="turbulence"
                            scale={displacementScale}
                            xChannelSelector="G"
                            yChannelSelector="B"
                        />
                    </filter>
                    <filter
                        id={chromaFilterId}
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                    >
                        <feComponentTransfer in="SourceGraphic" result="redChannel">
                            <feFuncR type="identity" />
                            <feFuncG type="discrete" tableValues="0" />
                            <feFuncB type="discrete" tableValues="0" />
                        </feComponentTransfer>
                        <feOffset
                            in="redChannel"
                            dx={-chromaticOffset}
                            dy="0"
                            result="redOffset"
                        />
                        <feComponentTransfer in="SourceGraphic" result="greenChannel">
                            <feFuncR type="discrete" tableValues="0" />
                            <feFuncG type="identity" />
                            <feFuncB type="discrete" tableValues="0" />
                        </feComponentTransfer>
                        <feOffset
                            in="greenChannel"
                            dx="0"
                            dy="0"
                            result="greenOffset"
                        />
                        <feComponentTransfer in="SourceGraphic" result="blueChannel">
                            <feFuncR type="discrete" tableValues="0" />
                            <feFuncG type="discrete" tableValues="0" />
                            <feFuncB type="identity" />
                        </feComponentTransfer>
                        <feOffset
                            in="blueChannel"
                            dx={chromaticOffset}
                            dy="0"
                            result="blueOffset"
                        />
                        <feBlend
                            in="redOffset"
                            in2="greenOffset"
                            mode="screen"
                            result="redGreen"
                        />
                        <feBlend in="redGreen" in2="blueOffset" mode="screen" />
                    </filter>
                </defs>
            </svg>

            <nav
                style={{
                    position: "relative",
                    zIndex: 3,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: pillGap,
                }}
            >
                {[
                    { v: item1Visible, l: item1Label, h: item1Href },
                    { v: item2Visible, l: item2Label, h: item2Href },
                    { v: item3Visible, l: item3Label, h: item3Href },
                    { v: item4Visible, l: item4Label, h: item4Href },
                    { v: item5Visible, l: item5Label, h: item5Href },
                    { v: item6Visible, l: item6Label, h: item6Href },
                ]
                    .filter((it) => it.v && it.l)
                    .map((it, i) => (
                        <a
                            key={`${i}-${it.l}-${it.h}`}
                            className={linkClass}
                            href={it.h}
                            style={linkStyle}
                        >
                            {it.l}
                        </a>
                    ))}
                {showCta && (
                    <a
                        href={ctaHref}
                        style={ctaOuterStyle}
                        aria-label={ctaLabel}
                    >
                        <span style={ctaBevelStyle}>
                            <span style={ctaCapStyle}>
                                <span
                                    className={ctaTextClass}
                                    style={ctaTextStyle}
                                >
                                    {ctaLabel}
                                </span>
                            </span>
                        </span>
                    </a>
                )}
            </nav>
        </div>
    )
}

addPropertyControls(LiquidNav, {
    // — Content (6 flat link slots — toggle each on/off, set its label + URL) —
    item1Visible: { type: ControlType.Boolean, title: "Item 1 — Show", defaultValue: true },
    item1Label: { type: ControlType.String, title: "Item 1 — Label", defaultValue: "Home", hidden: (p) => !p.item1Visible },
    item1Href: { type: ControlType.String, title: "Item 1 — Link", defaultValue: "./", hidden: (p) => !p.item1Visible },
    item2Visible: { type: ControlType.Boolean, title: "Item 2 — Show", defaultValue: true },
    item2Label: { type: ControlType.String, title: "Item 2 — Label", defaultValue: "About us", hidden: (p) => !p.item2Visible },
    item2Href: { type: ControlType.String, title: "Item 2 — Link", defaultValue: "./about-us", hidden: (p) => !p.item2Visible },
    item3Visible: { type: ControlType.Boolean, title: "Item 3 — Show", defaultValue: true },
    item3Label: { type: ControlType.String, title: "Item 3 — Label", defaultValue: "Designs", hidden: (p) => !p.item3Visible },
    item3Href: { type: ControlType.String, title: "Item 3 — Link", defaultValue: "./Our-Work", hidden: (p) => !p.item3Visible },
    item4Visible: { type: ControlType.Boolean, title: "Item 4 — Show", defaultValue: true },
    item4Label: { type: ControlType.String, title: "Item 4 — Label", defaultValue: "Prices", hidden: (p) => !p.item4Visible },
    item4Href: { type: ControlType.String, title: "Item 4 — Link", defaultValue: "./Pricing", hidden: (p) => !p.item4Visible },
    item5Visible: { type: ControlType.Boolean, title: "Item 5 — Show", defaultValue: false },
    item5Label: { type: ControlType.String, title: "Item 5 — Label", defaultValue: "Blog", hidden: (p) => !p.item5Visible },
    item5Href: { type: ControlType.String, title: "Item 5 — Link", defaultValue: "./blog", hidden: (p) => !p.item5Visible },
    item6Visible: { type: ControlType.Boolean, title: "Item 6 — Show", defaultValue: false },
    item6Label: { type: ControlType.String, title: "Item 6 — Label", defaultValue: "Contact", hidden: (p) => !p.item6Visible },
    item6Href: { type: ControlType.String, title: "Item 6 — Link", defaultValue: "./contact", hidden: (p) => !p.item6Visible },
    showCta: {
        type: ControlType.Boolean,
        title: "Show Metal CTA",
        defaultValue: true,
    },
    ctaLabel: {
        type: ControlType.String,
        title: "CTA Label",
        defaultValue: "Book a call",
        hidden: (p) => !p.showCta,
    },
    ctaHref: {
        type: ControlType.String,
        title: "CTA Link",
        defaultValue: "./leadgen-form-free-website-done-offer",
        hidden: (p) => !p.showCta,
    },

    // — Fonts —
    fontFamily: {
        type: ControlType.String,
        title: "Link Font",
        defaultValue:
            '"Satoshi", "Satoshi Placeholder", ui-sans-serif, system-ui, sans-serif',
    },
    ctaFontFamily: {
        type: ControlType.String,
        title: "CTA Font",
        defaultValue:
            '"Inter", "Inter Placeholder", ui-sans-serif, system-ui, sans-serif',
        hidden: (p) => !p.showCta,
    },
    loadSatoshiFont: {
        type: ControlType.Boolean,
        title: "Load Satoshi",
        defaultValue: true,
    },
    loadInterFont: {
        type: ControlType.Boolean,
        title: "Load Inter",
        defaultValue: true,
    },
    loadGeistFont: {
        type: ControlType.Boolean,
        title: "Load Geist",
        defaultValue: false,
    },

    // — Liquid-glass body —
    blurAmount: {
        type: ControlType.Number,
        title: "Blur",
        defaultValue: 4,
        min: 0,
        max: 20,
        step: 1,
    },
    brightness: {
        type: ControlType.Number,
        title: "Brightness",
        defaultValue: 1.1,
        min: 0.5,
        max: 2,
        step: 0.05,
    },
    chromaticOffset: {
        type: ControlType.Number,
        title: "Chromatic Offset (px)",
        defaultValue: 2,
        min: 0,
        max: 10,
        step: 0.5,
    },
    displacementScale: {
        type: ControlType.Number,
        title: "Displacement Scale",
        defaultValue: 200,
        min: 0,
        max: 500,
        step: 10,
    },
    glassBorderColor: {
        type: ControlType.Color,
        title: "Glass Border",
        defaultValue: "rgba(255, 255, 255, 0.125)",
    },
    cardColor: {
        type: ControlType.Color,
        title: "Card Tint",
        defaultValue: "rgba(20, 18, 30, 1)",
    },

    // — Pill layout —
    pillPadding: {
        type: ControlType.Number,
        title: "Pill Padding",
        defaultValue: 5,
        min: 0,
        max: 40,
        step: 1,
    },
    pillGap: {
        type: ControlType.Number,
        title: "Pill Gap",
        defaultValue: 10,
        min: 0,
        max: 40,
        step: 1,
    },
    pillBorderRadius: {
        type: ControlType.Number,
        title: "Pill Radius",
        defaultValue: 80,
        min: 0,
        max: 200,
        step: 1,
    },

    // — Link styling —
    linkColor: {
        type: ControlType.Color,
        title: "Link Color",
        defaultValue: "rgb(145, 145, 145)",
    },
    linkColorHover: {
        type: ControlType.Color,
        title: "Link Hover",
        defaultValue: "rgba(247, 245, 252, 1)",
    },
    linkPaddingX: {
        type: ControlType.Number,
        title: "Link Padding X",
        defaultValue: 20,
        min: 0,
        max: 60,
        step: 1,
    },
    linkPaddingY: {
        type: ControlType.Number,
        title: "Link Padding Y",
        defaultValue: 10,
        min: 0,
        max: 30,
        step: 1,
    },
    linkBorderRadius: {
        type: ControlType.Number,
        title: "Link Radius",
        defaultValue: 40,
        min: 0,
        max: 80,
        step: 1,
    },
    linkFontSize: {
        type: ControlType.Number,
        title: "Link Size",
        defaultValue: 16,
        min: 10,
        max: 28,
        step: 1,
    },
    linkFontWeight: {
        type: ControlType.Number,
        title: "Link Weight",
        defaultValue: 500,
        min: 100,
        max: 900,
        step: 100,
    },
    linkLineHeight: {
        type: ControlType.Number,
        title: "Link Line-Height",
        defaultValue: 19.2,
        min: 12,
        max: 32,
        step: 0.1,
    },
    linkLetterSpacing: {
        type: ControlType.Number,
        title: "Link Letter Spacing (em)",
        defaultValue: 0,
        min: -0.1,
        max: 0.1,
        step: 0.005,
    },
    transitionMs: {
        type: ControlType.Number,
        title: "Hover Transition (ms)",
        defaultValue: 150,
        min: 0,
        max: 1000,
        step: 25,
    },

    // — Metallic CTA —
    ctaHeight: {
        type: ControlType.Number,
        title: "CTA Height",
        defaultValue: 50,
        min: 28,
        max: 80,
        step: 1,
        hidden: (p) => !p.showCta,
    },
    ctaPaddingX: {
        type: ControlType.Number,
        title: "CTA Padding X",
        defaultValue: 20,
        min: 0,
        max: 60,
        step: 1,
        hidden: (p) => !p.showCta,
    },
    ctaTextColor: {
        type: ControlType.Color,
        title: "CTA Text",
        defaultValue: "rgb(186, 190, 194)",
        hidden: (p) => !p.showCta,
    },
    ctaTextColorHover: {
        type: ControlType.Color,
        title: "CTA Text Hover",
        defaultValue: "rgba(255, 255, 255, 1)",
        hidden: (p) => !p.showCta,
    },
    ctaFontSize: {
        type: ControlType.Number,
        title: "CTA Size",
        defaultValue: 16,
        min: 10,
        max: 28,
        step: 1,
        hidden: (p) => !p.showCta,
    },
    ctaFontWeight: {
        type: ControlType.Number,
        title: "CTA Weight",
        defaultValue: 500,
        min: 100,
        max: 900,
        step: 100,
        hidden: (p) => !p.showCta,
    },
    ctaLineHeight: {
        type: ControlType.Number,
        title: "CTA Line-Height",
        defaultValue: 19.2,
        min: 12,
        max: 32,
        step: 0.1,
        hidden: (p) => !p.showCta,
    },
    ctaLetterSpacingEm: {
        type: ControlType.Number,
        title: "CTA Tracking (em)",
        defaultValue: -0.01,
        min: -0.1,
        max: 0.1,
        step: 0.005,
        hidden: (p) => !p.showCta,
    },
    ctaFrameColorTop: {
        type: ControlType.Color,
        title: "CTA Frame Top",
        defaultValue: "rgb(31, 31, 31)",
        hidden: (p) => !p.showCta,
    },
    ctaFrameColorBottom: {
        type: ControlType.Color,
        title: "CTA Frame Bottom",
        defaultValue: "rgb(0, 0, 0)",
        hidden: (p) => !p.showCta,
    },
    ctaBevelColor1: {
        type: ControlType.Color,
        title: "Bevel 1 (0%)",
        defaultValue: "rgb(227, 227, 227)",
        hidden: (p) => !p.showCta,
    },
    ctaBevelColor2: {
        type: ControlType.Color,
        title: "Bevel 2 (17%)",
        defaultValue: "rgb(112, 112, 112)",
        hidden: (p) => !p.showCta,
    },
    ctaBevelColor3: {
        type: ControlType.Color,
        title: "Bevel 3 (33%)",
        defaultValue: "rgb(59, 59, 59)",
        hidden: (p) => !p.showCta,
    },
    ctaBevelColor4: {
        type: ControlType.Color,
        title: "Bevel 4 (58.5%)",
        defaultValue: "rgb(18, 18, 18)",
        hidden: (p) => !p.showCta,
    },
    ctaBevelColor5: {
        type: ControlType.Color,
        title: "Bevel 5 (87.8%)",
        defaultValue: "rgb(51, 51, 51)",
        hidden: (p) => !p.showCta,
    },
    ctaBevelColor6: {
        type: ControlType.Color,
        title: "Bevel 6 (100%)",
        defaultValue: "rgb(102, 102, 102)",
        hidden: (p) => !p.showCta,
    },
    ctaCapColor1: {
        type: ControlType.Color,
        title: "Cap 1 (0%)",
        defaultValue: "rgb(71, 77, 80)",
        hidden: (p) => !p.showCta,
    },
    ctaCapColor2: {
        type: ControlType.Color,
        title: "Cap 2 (42%)",
        defaultValue: "rgb(39, 43, 45)",
        hidden: (p) => !p.showCta,
    },
    ctaCapColor3: {
        type: ControlType.Color,
        title: "Cap 3 (74%)",
        defaultValue: "rgb(30, 32, 33)",
        hidden: (p) => !p.showCta,
    },
    ctaCapColor4: {
        type: ControlType.Color,
        title: "Cap 4 (100%)",
        defaultValue: "rgb(19, 20, 21)",
        hidden: (p) => !p.showCta,
    },
    ctaShadowColor: {
        type: ControlType.Color,
        title: "CTA Shadow Color",
        defaultValue: "rgba(0, 0, 0, 0.3)",
        hidden: (p) => !p.showCta,
    },
    ctaShadowY: {
        type: ControlType.Number,
        title: "CTA Shadow Y",
        defaultValue: 5,
        min: 0,
        max: 30,
        step: 1,
        hidden: (p) => !p.showCta,
    },
    ctaShadowBlur: {
        type: ControlType.Number,
        title: "CTA Shadow Blur",
        defaultValue: 10,
        min: 0,
        max: 40,
        step: 1,
        hidden: (p) => !p.showCta,
    },
    ctaShadowSpread: {
        type: ControlType.Number,
        title: "CTA Shadow Spread",
        defaultValue: 5,
        min: 0,
        max: 20,
        step: 1,
        hidden: (p) => !p.showCta,
    },
    ctaInnerHighlight: {
        type: ControlType.Color,
        title: "CTA Inner Highlight",
        defaultValue: "rgba(255, 255, 255, 0.2)",
        hidden: (p) => !p.showCta,
    },
})
