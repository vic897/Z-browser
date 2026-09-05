export function resolveNavigationInput(input: string): string {
    const value = input.trim();

    if (value.length === 0) {
        return "";
    }

    // Explicit HTTP/HTTPS URL
    if (/^https?:\/\//i.test(value)) {
        return value;
    }

    // Looks like a domain
    if (value.includes(".") && !value.includes(" ")) {
        return `https://${value}`;
    }

    // Otherwise treat it as a search query
    return `https://www.google.com/search?q=${encodeURIComponent(value)}`;
}