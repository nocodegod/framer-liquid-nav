// Local-preview mock of Framer's `framer` module. Framer's real runtime
// provides addPropertyControls() and the ControlType enum to code components
// at import time; locally we only need stubs so the bundle's import resolves.
export function addPropertyControls() {}
export const ControlType = {
    String: "string",
    Number: "number",
    Boolean: "boolean",
    Color: "color",
    Array: "array",
    Object: "object",
    Link: "link",
    Enum: "enum",
    File: "file",
    Image: "image",
    ComponentInstance: "componentinstance",
    EventHandler: "eventhandler",
}
export default { addPropertyControls, ControlType }
