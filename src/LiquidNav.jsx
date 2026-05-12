import { useEffect, useId } from "react"
import { addPropertyControls, ControlType } from "framer"

// ============================================
// LiquidNav — pill-shaped liquid-glass navigation
// Recreated 1:1 from the SolCard reference HTML.
// ============================================

const GEIST_HREF = "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&display=swap"

function useGeistFont(enabled) {
    useEffect(() => {
        if (!enabled) return
        if (typeof document === "undefined") return
        if (document.querySelector("link[data-liquidnav-geist]")) return
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = GEIST_HREF
        link.setAttribute("data-liquidnav-geist", "")
        document.head.appendChild(link)
    }, [enabled])
}

export default function LiquidNav({
    items = [
        { label: "Startseite", href: "#home" },
        { label: "Karten", href: "#cards" },
        { label: "Token", href: "#token" },
    ],
    fontFamily = '"Geist", ui-sans-serif, system-ui, -apple-system, sans-serif',
    loadGeistFont = true,
    blurAmount = 4,
    brightness = 1.1,
    chromaticOffset = 2,
    displacementScale = 200,
    glassBorderColor = "rgba(255, 255, 255, 0.125)",
    glassHighlight = "rgba(255, 255, 255, 0.45)",
    cardColor = "rgba(20, 18, 30, 1)",
    textColor = "rgba(247, 245, 252, 1)",
    linkOpacity = 0.7,
    linkOpacityHover = 0.95,
    pillVerticalPadding = 8,
    linkHeight = 40,
    sidePadding = 22,
    linkSpacing = 10,
    fontSize = 14,
    fontWeight = 500,
    letterSpacing = 0.02,
}) {
    useGeistFont(loadGeistFont)

    // Per-instance stable IDs so multiple pills on a page don't collide
    const rawId = useId()
    const safeId = "ln" + rawId.replace(/[^a-zA-Z0-9]/g, "")
    const dispFilterId = safeId + "_disp"
    const chromaFilterId = safeId + "_chroma"
    const linkClass = safeId + "_link"
    const ringClass = safeId + "_ring"
    const pillClass = safeId + "_pill"

    // Scoped CSS — :hover, vendor-prefixed mask-composite, and backdrop-filter
    // with SVG filter refs (per-instance IDs make this dynamic).
    const css = `
.${pillClass} {
    backdrop-filter: brightness(${brightness}) blur(${blurAmount}px) url(#${dispFilterId}) url(#${chromaFilterId});
    -webkit-backdrop-filter: brightness(${brightness}) blur(${blurAmount}px);
}
.${ringClass} {
    -webkit-mask:
        linear-gradient(#000 0 0) content-box,
        linear-gradient(#000 0 0);
    mask:
        linear-gradient(#000 0 0) content-box,
        linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
}
.${linkClass} { transition: opacity 220ms ease; }
.${linkClass}:hover { opacity: ${linkOpacityHover} !important; }
`.trim()

    const pillStyle = {
        position: "relative",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "fit-content",
        height: "fit-content",
        padding: `${pillVerticalPadding}px 0`,
        borderRadius: 9999,
        overflow: "hidden",
        borderTop: 0,
        borderBottom: 0,
        borderLeft: `1px solid ${glassBorderColor}`,
        borderRight: `1px solid ${glassBorderColor}`,
        background: `linear-gradient(to bottom, ${cardColor} 0%, rgba(255,255,255,0) 100%)`,
        fontFamily,
    }

    const ringStyle = {
        position: "absolute",
        inset: 0,
        borderRadius: 9999,
        pointerEvents: "none",
        zIndex: 1,
        padding: "0.5px",
        background: `linear-gradient(to bottom, ${glassHighlight} 0%, rgba(255,255,255,0.05) 35%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.08) 100%)`,
    }

    const glossStyle = {
        position: "absolute",
        inset: 0,
        borderRadius: 9999,
        zIndex: 2,
        pointerEvents: "none",
        overflow: "hidden",
        background: [
            "radial-gradient(120% 60% at 50% -10%, rgba(255,255,255,0.10), transparent 60%)",
            "radial-gradient(120% 60% at 50% 120%, rgba(255,255,255,0.04), transparent 60%)",
        ].join(", "),
    }

    const navStyle = {
        position: "relative",
        zIndex: 3,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    }

    return (
        <div className={pillClass} style={pillStyle}>
            <style>{css}</style>

            {/* SVG defs — per-instance IDs, hidden from layout */}
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

            <div className={ringClass} style={ringStyle} />
            <div style={glossStyle} />

            <nav style={navStyle}>
                {items.map((item, i) => {
                    const isFirst = i === 0
                    const isLast = i === items.length - 1
                    return (
                        <a
                            key={`${i}-${item.label}-${item.href}`}
                            className={linkClass}
                            href={item.href}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                height: linkHeight,
                                paddingLeft: isFirst ? sidePadding : linkSpacing,
                                paddingRight: isLast ? sidePadding : linkSpacing,
                                fontSize,
                                lineHeight: "18px",
                                fontWeight,
                                letterSpacing: `${letterSpacing}em`,
                                color: textColor,
                                textDecoration: "none",
                                opacity: linkOpacity,
                            }}
                        >
                            {item.label}
                        </a>
                    )
                })}
            </nav>
        </div>
    )
}

addPropertyControls(LiquidNav, {
    items: {
        type: ControlType.Array,
        title: "Links",
        control: {
            type: ControlType.Object,
            controls: {
                label: { type: ControlType.String, defaultValue: "Link" },
                href: { type: ControlType.String, defaultValue: "#" },
            },
        },
        defaultValue: [
            { label: "Startseite", href: "#home" },
            { label: "Karten", href: "#cards" },
            { label: "Token", href: "#token" },
        ],
    },
    fontFamily: {
        type: ControlType.String,
        title: "Font Family",
        defaultValue: '"Geist", ui-sans-serif, system-ui, sans-serif',
    },
    loadGeistFont: {
        type: ControlType.Boolean,
        title: "Load Geist Font",
        defaultValue: true,
    },
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
    glassHighlight: {
        type: ControlType.Color,
        title: "Highlight",
        defaultValue: "rgba(255, 255, 255, 0.45)",
    },
    cardColor: {
        type: ControlType.Color,
        title: "Card Tint",
        defaultValue: "rgba(20, 18, 30, 1)",
    },
    textColor: {
        type: ControlType.Color,
        title: "Text Color",
        defaultValue: "rgba(247, 245, 252, 1)",
    },
    linkOpacity: {
        type: ControlType.Number,
        title: "Link Opacity",
        defaultValue: 0.7,
        min: 0,
        max: 1,
        step: 0.05,
        displayStepper: true,
    },
    linkOpacityHover: {
        type: ControlType.Number,
        title: "Hover Opacity",
        defaultValue: 0.95,
        min: 0,
        max: 1,
        step: 0.05,
        displayStepper: true,
    },
    pillVerticalPadding: {
        type: ControlType.Number,
        title: "Pill Vert. Padding",
        defaultValue: 8,
        min: 0,
        max: 40,
        step: 1,
    },
    linkHeight: {
        type: ControlType.Number,
        title: "Link Row Height",
        defaultValue: 40,
        min: 24,
        max: 80,
        step: 2,
    },
    sidePadding: {
        type: ControlType.Number,
        title: "Side Padding",
        defaultValue: 22,
        min: 0,
        max: 60,
        step: 1,
    },
    linkSpacing: {
        type: ControlType.Number,
        title: "Inter-link Spacing",
        defaultValue: 10,
        min: 0,
        max: 40,
        step: 1,
    },
    fontSize: {
        type: ControlType.Number,
        title: "Font Size",
        defaultValue: 14,
        min: 10,
        max: 24,
        step: 1,
    },
    fontWeight: {
        type: ControlType.Number,
        title: "Font Weight",
        defaultValue: 500,
        min: 100,
        max: 900,
        step: 100,
    },
    letterSpacing: {
        type: ControlType.Number,
        title: "Letter Spacing (em)",
        defaultValue: 0.02,
        min: 0,
        max: 0.1,
        step: 0.005,
    },
})
