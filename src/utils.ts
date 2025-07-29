export const mapToObject = (map: Map<string, any>) => {
    const obj = {};
    for (const [key, value] of map) {
        //@ts-ignore
        // eslint-disable-next-line
        obj[key] = value instanceof Map ? mapToObject(value) : value;
    }
    return obj;
};
