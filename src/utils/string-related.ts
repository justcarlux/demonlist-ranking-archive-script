export function stringifyAny(object: any): string {
    if (object === undefined) return "undefined";
    if (object === null) return "null";
    return typeof object === 'object' ?
        (Object.keys(object).length ? JSON.stringify(object, null, 4) : object.toString())
    : object.toString();
}
