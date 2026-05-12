const R = window.__FRAMER_REACT
export function jsx(type, props, key) {
    if (key !== undefined) props.key = key
    return R.createElement(type, props)
}
export function jsxs(type, props, key) {
    if (key !== undefined) props.key = key
    return R.createElement(type, props)
}
export const Fragment = R.Fragment
