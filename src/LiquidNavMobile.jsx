import { useEffect, useId, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

// ============================================
// LiquidNavMobile — round hamburger trigger + liquid-glass dropdown panel.
//
// Companion to LiquidNav.jsx for mobile viewports. Replicates the
// lightsite.studio mobile nav 1:1 (round dark hamburger button at top-right,
// two grey lines that morph into an X on tap, dropdown panel with stacked
// links + metallic Book-a-call CTA) with one upgrade: the dropdown is a true
// position:absolute overlay so the liquid-glass backdrop-filter actually
// refracts the page content underneath — the original used a solid
// rgb(18,18,18) in-flow panel, which would have wasted the glass effect.
// ============================================

const SATOSHI_HREF =
    "https://api.fontshare.com/v2/css?f%5B%5D=satoshi@500,700,400&display=swap"
const INTER_HREF =
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"

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

export default function LiquidNavMobile({
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

    // — Hamburger button —
    hamburgerSize = 44,
    hamburgerBgColor = "rgba(20, 18, 30, 1)",
    hamburgerBorderColor = "rgba(255, 255, 255, 0.125)",
    hamburgerLineColor = "rgb(153, 153, 153)",
    hamburgerLineColorOpen = "rgba(247, 245, 252, 1)",
    hamburgerLineWidth = 20,
    hamburgerLineThickness = 2,
    hamburgerLineGap = 6,
    hamburgerAlign = "right", // "left" | "right" | "center"
    useGlassHamburger = true, // when true, hamburger uses liquid-glass body instead of solid fill

    // — Liquid-glass body (shared by panel and optionally hamburger) —
    blurAmount = 8,
    brightness = 1.05,
    chromaticOffset = 1,
    displacementScale = 150,
    glassBorderColor = "rgba(255, 255, 255, 0.125)",
    cardColor = "rgba(20, 18, 30, 0.85)",

    // — Panel layout —
    panelOffsetY = 8,
    panelPadding = 20,
    panelBorderRadius = 18,
    panelGap = 4,
    panelMaxWidth = 400,

    // — Link styling —
    linkColor = "rgb(145, 145, 145)",
    linkColorHover = "rgba(247, 245, 252, 1)",
    linkPaddingX = 20,
    linkPaddingY = 10,
    linkBorderRadius = 40,
    linkFontSize = 16,
    linkFontWeight = 500,
    linkLineHeight = 19.2,
    linkAlign = "center", // "left" | "center" | "right"
    transitionMs = 250,

    // — Metallic CTA —
    ctaHeight = 50,
    ctaPaddingX = 20,
    ctaTextColor = "rgb(186, 190, 194)",
    ctaTextColorHover = "rgba(255, 255, 255, 1)",
    ctaFontSize = 16,
    ctaFontWeight = 500,
    ctaLineHeight = 19.2,
    ctaLetterSpacingEm = -0.01,
    ctaMarginTop = 8,
    ctaFullWidth = false,

    // — Behaviour —
    closeOnLinkClick = true,
    lockBodyScroll = false,
    initialOpen = false,
}) {
    useExternalFont(SATOSHI_HREF, "data-liquidnavmobile-satoshi", loadSatoshiFont)
    useExternalFont(INTER_HREF, "data-liquidnavmobile-inter", loadInterFont)

    const [open, setOpen] = useState(!!initialOpen)

    // Optional body scroll lock when menu is open.
    useEffect(() => {
        if (!lockBodyScroll || typeof document === "undefined") return
        const prev = document.body.style.overflow
        if (open) document.body.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = prev
        }
    }, [open, lockBodyScroll])

    // Per-instance stable IDs so multiple instances on a page don't collide
    // on SVG filter `url(#id)` references or scoped CSS class names.
    const rawId = useId()
    const safeId = "lnm" + rawId.replace(/[^a-zA-Z0-9]/g, "")
    const dispFilterId = safeId + "_disp"
    const chromaFilterId = safeId + "_chroma"
    const wrapperClass = safeId + "_wrap"
    const panelClass = safeId + "_panel"
    const hamburgerClass = safeId + "_burger"
    const lineClass = safeId + "_line"
    const linkClass = safeId + "_link"
    const ctaTextClass = safeId + "_ctatxt"

    // Build items list from flat props
    const items = [
        { v: item1Visible, l: item1Label, h: item1Href },
        { v: item2Visible, l: item2Label, h: item2Href },
        { v: item3Visible, l: item3Label, h: item3Href },
        { v: item4Visible, l: item4Label, h: item4Href },
        { v: item5Visible, l: item5Label, h: item5Href },
        { v: item6Visible, l: item6Label, h: item6Href },
    ].filter((it) => it.v && it.l)

    // Hamburger alignment inside the top bar
    const topBarJustify =
        hamburgerAlign === "left"
            ? "flex-start"
            : hamburgerAlign === "center"
                ? "center"
                : "flex-end"

    // Panel horizontal anchoring follows the hamburger so the panel grows from
    // under the button rather than across the whole row.
    const panelAnchor =
        hamburgerAlign === "left"
            ? { left: 0 }
            : hamburgerAlign === "center"
                ? { left: "50%", transform: open ? "translate(-50%, 0)" : "translate(-50%, -8px)" }
                : { right: 0 }

    // Metallic CTA gradients — same construction as desktop LiquidNav so the
    // visual signature stays consistent across breakpoints.
    const frameGradient = "linear-gradient(rgb(31, 31, 31) 0%, rgb(0, 0, 0) 100%)"
    const bevelGradient =
        "linear-gradient(rgb(227, 227, 227) 0%, rgb(112, 112, 112) 17%, rgb(59, 59, 59) 33%, rgb(18, 18, 18) 58.5462%, rgb(51, 51, 51) 87.8378%, rgb(102, 102, 102) 100%)"
    const capGradient =
        "linear-gradient(rgb(71, 77, 80) 0%, rgb(39, 43, 45) 42%, rgb(30, 32, 33) 74%, rgb(19, 20, 21) 100%)"

    // Single liquid-glass body recipe reused by the panel (and optionally the
    // hamburger button) — keeps the visual identity unified.
    const glassBackdropCss = `
backdrop-filter: brightness(${brightness}) blur(${blurAmount}px) url(#${dispFilterId}) url(#${chromaFilterId});
-webkit-backdrop-filter: brightness(${brightness}) blur(${blurAmount}px);
`.trim()

    const glassBackground = `linear-gradient(to bottom, ${cardColor} 0%, rgba(255,255,255,0.02) 100%)`

    const css = `
.${wrapperClass} { position: relative; display: inline-block; width: 100%; }

.${hamburgerClass} {
    position: relative;
    width: ${hamburgerSize}px;
    height: ${hamburgerSize}px;
    border-radius: 9999px;
    border: 0;
    padding: 0;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: ${useGlassHamburger ? glassBackground : hamburgerBgColor};
    ${useGlassHamburger ? `border-left: 1px solid ${hamburgerBorderColor}; border-right: 1px solid ${hamburgerBorderColor};` : ""}
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
}
${useGlassHamburger ? `.${hamburgerClass} { ${glassBackdropCss} }` : ""}

.${lineClass} {
    position: absolute;
    left: 50%;
    top: 50%;
    width: ${hamburgerLineWidth}px;
    height: ${hamburgerLineThickness}px;
    border-radius: ${hamburgerLineThickness}px;
    background: ${hamburgerLineColor};
    transition:
        transform ${transitionMs}ms cubic-bezier(0.4, 0, 0.2, 1),
        background-color ${transitionMs}ms ease;
    will-change: transform;
}
.${lineClass}[data-pos="top"] { transform: translate(-50%, calc(-50% - ${hamburgerLineGap / 2 + hamburgerLineThickness / 2}px)); }
.${lineClass}[data-pos="bottom"] { transform: translate(-50%, calc(-50% + ${hamburgerLineGap / 2 + hamburgerLineThickness / 2}px)); }
.${lineClass}[data-open="true"][data-pos="top"] { transform: translate(-50%, -50%) rotate(45deg); background: ${hamburgerLineColorOpen}; }
.${lineClass}[data-open="true"][data-pos="bottom"] { transform: translate(-50%, -50%) rotate(-45deg); background: ${hamburgerLineColorOpen}; }

.${panelClass} {
    position: absolute;
    top: calc(100% + ${panelOffsetY}px);
    width: 100%;
    max-width: ${panelMaxWidth}px;
    padding: ${panelPadding}px;
    border-radius: ${panelBorderRadius}px;
    overflow: hidden;
    border-left: 1px solid ${glassBorderColor};
    border-right: 1px solid ${glassBorderColor};
    background: ${glassBackground};
    ${glassBackdropCss};
    display: flex;
    flex-direction: column;
    gap: ${panelGap}px;
    transform-origin: top ${hamburgerAlign === "left" ? "left" : hamburgerAlign === "center" ? "center" : "right"};
    transition:
        opacity ${transitionMs}ms cubic-bezier(0.4, 0, 0.2, 1),
        transform ${transitionMs}ms cubic-bezier(0.4, 0, 0.2, 1),
        visibility 0s linear ${transitionMs}ms;
    z-index: 1000;
    font-family: ${fontFamily};
}
.${panelClass}[data-open="false"] {
    opacity: 0;
    transform: scale(0.96) translateY(-8px);
    visibility: hidden;
    pointer-events: none;
}
.${panelClass}[data-open="true"] {
    opacity: 1;
    transform: scale(1) translateY(0);
    visibility: visible;
    pointer-events: auto;
    transition:
        opacity ${transitionMs}ms cubic-bezier(0.4, 0, 0.2, 1),
        transform ${transitionMs}ms cubic-bezier(0.4, 0, 0.2, 1),
        visibility 0s linear 0s;
}

.${linkClass} {
    display: flex;
    align-items: center;
    justify-content: ${linkAlign === "left" ? "flex-start" : linkAlign === "right" ? "flex-end" : "center"};
    padding: ${linkPaddingY}px ${linkPaddingX}px;
    border-radius: ${linkBorderRadius}px;
    font-family: ${fontFamily};
    font-size: ${linkFontSize}px;
    line-height: ${linkLineHeight}px;
    font-weight: ${linkFontWeight};
    color: ${linkColor};
    background: transparent;
    text-decoration: none;
    transition: color ${transitionMs}ms ease, background-color ${transitionMs}ms ease;
    white-space: nowrap;
}
.${linkClass}:hover { color: ${linkColorHover}; }

.${ctaTextClass} { color: ${ctaTextColor}; transition: color ${transitionMs}ms ease; }
.${panelClass} a:hover .${ctaTextClass} { color: ${ctaTextColorHover}; }
`.trim()

    const onLinkClick = () => {
        if (closeOnLinkClick) setOpen(false)
    }

    // — Metallic CTA layered styles —
    const ctaOuterStyle = {
        position: "relative",
        display: ctaFullWidth ? "flex" : "inline-flex",
        alignItems: "stretch",
        justifyContent: "center",
        height: ctaHeight,
        marginTop: ctaMarginTop,
        alignSelf: ctaFullWidth ? "stretch" : "center",
        padding: 1,
        borderRadius: 1000,
        background: frameGradient,
        boxShadow: "0 5px 10px 5px rgba(0,0,0,0.3)",
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
        boxShadow: "inset 0 -1px 0 0 rgba(255,255,255,0.2)",
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
        <div className={wrapperClass}>
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

            {/* Top bar — just hosts the hamburger; align via flex */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: topBarJustify,
                    width: "100%",
                }}
            >
                <button
                    type="button"
                    aria-label={open ? "Close menu" : "Open menu"}
                    aria-expanded={open}
                    onClick={() => setOpen((o) => !o)}
                    className={hamburgerClass}
                >
                    <span
                        className={lineClass}
                        data-pos="top"
                        data-open={open ? "true" : "false"}
                    />
                    <span
                        className={lineClass}
                        data-pos="bottom"
                        data-open={open ? "true" : "false"}
                    />
                </button>
            </div>

            {/* Overlay panel */}
            <div
                className={panelClass}
                data-open={open ? "true" : "false"}
                style={panelAnchor}
            >
                {items.map((it, i) => (
                    <a
                        key={`${i}-${it.l}-${it.h}`}
                        className={linkClass}
                        href={it.h}
                        onClick={onLinkClick}
                    >
                        {it.l}
                    </a>
                ))}
                {showCta && (
                    <a
                        href={ctaHref}
                        style={ctaOuterStyle}
                        aria-label={ctaLabel}
                        onClick={onLinkClick}
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
            </div>
        </div>
    )
}

addPropertyControls(LiquidNavMobile, {
    // — Content (6 flat link slots — toggle each on/off, set its label + URL) —
    item1Visible: { type: ControlType.Boolean, title: "Item 1 — Show", defaultValue: true },
    item1Label: { type: ControlType.String, title: "Item 1 — Label", defaultValue: "Home", hidden: (p) => !p.item1Visible },
    item1Href: { type: ControlType.Link, title: "Item 1 — Link", hidden: (p) => !p.item1Visible },
    item2Visible: { type: ControlType.Boolean, title: "Item 2 — Show", defaultValue: true },
    item2Label: { type: ControlType.String, title: "Item 2 — Label", defaultValue: "About us", hidden: (p) => !p.item2Visible },
    item2Href: { type: ControlType.Link, title: "Item 2 — Link", hidden: (p) => !p.item2Visible },
    item3Visible: { type: ControlType.Boolean, title: "Item 3 — Show", defaultValue: true },
    item3Label: { type: ControlType.String, title: "Item 3 — Label", defaultValue: "Designs", hidden: (p) => !p.item3Visible },
    item3Href: { type: ControlType.Link, title: "Item 3 — Link", hidden: (p) => !p.item3Visible },
    item4Visible: { type: ControlType.Boolean, title: "Item 4 — Show", defaultValue: true },
    item4Label: { type: ControlType.String, title: "Item 4 — Label", defaultValue: "Prices", hidden: (p) => !p.item4Visible },
    item4Href: { type: ControlType.Link, title: "Item 4 — Link", hidden: (p) => !p.item4Visible },
    item5Visible: { type: ControlType.Boolean, title: "Item 5 — Show", defaultValue: false },
    item5Label: { type: ControlType.String, title: "Item 5 — Label", defaultValue: "Blog", hidden: (p) => !p.item5Visible },
    item5Href: { type: ControlType.Link, title: "Item 5 — Link", hidden: (p) => !p.item5Visible },
    item6Visible: { type: ControlType.Boolean, title: "Item 6 — Show", defaultValue: false },
    item6Label: { type: ControlType.String, title: "Item 6 — Label", defaultValue: "Contact", hidden: (p) => !p.item6Visible },
    item6Href: { type: ControlType.Link, title: "Item 6 — Link", hidden: (p) => !p.item6Visible },

    // — CTA —
    showCta: { type: ControlType.Boolean, title: "Show Metal CTA", defaultValue: true },
    ctaLabel: { type: ControlType.String, title: "CTA Label", defaultValue: "Book a call", hidden: (p) => !p.showCta },
    ctaHref: { type: ControlType.Link, title: "CTA Link", hidden: (p) => !p.showCta },
    ctaFullWidth: { type: ControlType.Boolean, title: "CTA Full Width", defaultValue: false, hidden: (p) => !p.showCta },
    ctaMarginTop: { type: ControlType.Number, title: "CTA Margin Top", defaultValue: 8, min: 0, max: 40, step: 1, hidden: (p) => !p.showCta },

    // — Hamburger —
    hamburgerAlign: {
        type: ControlType.Enum,
        title: "Hamburger Align",
        defaultValue: "right",
        options: ["left", "center", "right"],
        optionTitles: ["Left", "Center", "Right"],
    },
    hamburgerSize: { type: ControlType.Number, title: "Hamburger Size", defaultValue: 44, min: 28, max: 80, step: 1 },
    useGlassHamburger: { type: ControlType.Boolean, title: "Glass Hamburger", defaultValue: true },
    hamburgerBgColor: { type: ControlType.Color, title: "Hamburger Fill", defaultValue: "rgba(20, 18, 30, 1)", hidden: (p) => !!p.useGlassHamburger },
    hamburgerBorderColor: { type: ControlType.Color, title: "Hamburger Border", defaultValue: "rgba(255, 255, 255, 0.125)", hidden: (p) => !p.useGlassHamburger },
    hamburgerLineColor: { type: ControlType.Color, title: "Line Color", defaultValue: "rgb(153, 153, 153)" },
    hamburgerLineColorOpen: { type: ControlType.Color, title: "Line Color (Open)", defaultValue: "rgba(247, 245, 252, 1)" },
    hamburgerLineWidth: { type: ControlType.Number, title: "Line Width", defaultValue: 20, min: 8, max: 32, step: 1 },
    hamburgerLineThickness: { type: ControlType.Number, title: "Line Thickness", defaultValue: 2, min: 1, max: 6, step: 1 },
    hamburgerLineGap: { type: ControlType.Number, title: "Line Gap", defaultValue: 6, min: 0, max: 20, step: 1 },

    // — Liquid-glass body —
    blurAmount: { type: ControlType.Number, title: "Blur", defaultValue: 8, min: 0, max: 40, step: 1 },
    brightness: { type: ControlType.Number, title: "Brightness", defaultValue: 1.05, min: 0.5, max: 2, step: 0.05 },
    chromaticOffset: { type: ControlType.Number, title: "Chromatic Offset", defaultValue: 1, min: 0, max: 10, step: 0.5 },
    displacementScale: { type: ControlType.Number, title: "Displacement", defaultValue: 150, min: 0, max: 500, step: 10 },
    glassBorderColor: { type: ControlType.Color, title: "Glass Border", defaultValue: "rgba(255, 255, 255, 0.125)" },
    cardColor: { type: ControlType.Color, title: "Card Tint", defaultValue: "rgba(20, 18, 30, 0.85)" },

    // — Panel —
    panelOffsetY: { type: ControlType.Number, title: "Panel Offset Y", defaultValue: 8, min: 0, max: 40, step: 1 },
    panelPadding: { type: ControlType.Number, title: "Panel Padding", defaultValue: 20, min: 0, max: 48, step: 1 },
    panelBorderRadius: { type: ControlType.Number, title: "Panel Radius", defaultValue: 18, min: 0, max: 48, step: 1 },
    panelGap: { type: ControlType.Number, title: "Panel Item Gap", defaultValue: 4, min: 0, max: 24, step: 1 },
    panelMaxWidth: { type: ControlType.Number, title: "Panel Max Width", defaultValue: 400, min: 200, max: 800, step: 10 },

    // — Link styling —
    linkAlign: {
        type: ControlType.Enum,
        title: "Link Align",
        defaultValue: "center",
        options: ["left", "center", "right"],
        optionTitles: ["Left", "Center", "Right"],
    },
    linkColor: { type: ControlType.Color, title: "Link Color", defaultValue: "rgb(145, 145, 145)" },
    linkColorHover: { type: ControlType.Color, title: "Link Hover", defaultValue: "rgba(247, 245, 252, 1)" },
    linkPaddingX: { type: ControlType.Number, title: "Link Padding X", defaultValue: 20, min: 0, max: 60, step: 1 },
    linkPaddingY: { type: ControlType.Number, title: "Link Padding Y", defaultValue: 10, min: 0, max: 30, step: 1 },
    linkBorderRadius: { type: ControlType.Number, title: "Link Radius", defaultValue: 40, min: 0, max: 80, step: 1 },
    linkFontSize: { type: ControlType.Number, title: "Link Size", defaultValue: 16, min: 10, max: 28, step: 1 },
    linkFontWeight: { type: ControlType.Number, title: "Link Weight", defaultValue: 500, min: 100, max: 900, step: 100 },
    linkLineHeight: { type: ControlType.Number, title: "Link Line-Height", defaultValue: 19.2, min: 12, max: 32, step: 0.1 },

    // — Behavior —
    transitionMs: { type: ControlType.Number, title: "Animation (ms)", defaultValue: 250, min: 0, max: 1000, step: 25 },
    closeOnLinkClick: { type: ControlType.Boolean, title: "Close On Link Click", defaultValue: true },
    lockBodyScroll: { type: ControlType.Boolean, title: "Lock Page Scroll", defaultValue: false },
    initialOpen: { type: ControlType.Boolean, title: "Start Open (preview)", defaultValue: false },

    // — Fonts —
    fontFamily: { type: ControlType.String, title: "Link Font", defaultValue: '"Satoshi", "Satoshi Placeholder", ui-sans-serif, system-ui, sans-serif' },
    ctaFontFamily: { type: ControlType.String, title: "CTA Font", defaultValue: '"Inter", "Inter Placeholder", ui-sans-serif, system-ui, sans-serif', hidden: (p) => !p.showCta },
    loadSatoshiFont: { type: ControlType.Boolean, title: "Load Satoshi", defaultValue: true },
    loadInterFont: { type: ControlType.Boolean, title: "Load Inter", defaultValue: true },
})
