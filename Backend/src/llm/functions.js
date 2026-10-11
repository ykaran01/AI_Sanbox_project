export const normalizeCode = (code) => {
    if (typeof code !== "string") {
        return "";
    }

    return code
        .replace(/\\r\\n/g, "\n")
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\n");
};

export const normalizeStdin = (stdin) => {
    if (typeof stdin !== "string") {
        return "";
    }

    return stdin
        .replace(/\\r\\n/g, "\n")
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\n");
};

