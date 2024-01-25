const bcrypt = require('bcrypt');
const saltRounds = 10;

export const hashPassword = async (rawPassword: String): Promise<string> => {
    const passwordHash = await bcrypt.hash(rawPassword, saltRounds);
    return passwordHash;
};

export const comparePassword = async (userInput: String, passwordHash: String) => {
    const passCorrect = await bcrypt.compare(userInput, passwordHash);
    return passCorrect;
};