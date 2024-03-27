const crypto = require("crypto");

export const getGravatarUrl = async (email: String): Promise<string> => {
    const hash = await crypto.createHash('md5').update(email).digest("hex")
    return `https://gravatar.com/avatar/${hash}?s=100&r=pg&d=404`
};
