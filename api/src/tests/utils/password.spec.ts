import { describe, expect, test } from '@jest/globals';
import { hashPassword, comparePassword } from '@/utils/passwords';
import { generateSecureCode, getUserIdFromJWT } from '@/utils/auth';

describe('password hashing', () => {
    test('password hashes into string', async () => {
        const password = 'password'
        const hashedPassword = await hashPassword(password)
        expect(typeof hashedPassword === 'string')
    });

    test('compare password - correct hash, it should pass', async () => {
        const testPassword = 'password'
        const testHash = '$2b$10$270tb6yVJU3Uc3h.WWG2YuK59b7JieoU0TOOtkhet80HAUfqOCjR2'
        expect(await comparePassword(testPassword, testHash)).toEqual(true)
    });


    test('compare password - incorrect hash, it should fail', async () => {
        const testPassword = 'password1234'
        const testHash = '$2b$10$270tb6yVJU3Uc3h.WWG2YuK59b7JieoU0TOOtkhet80HAUfqOCjR2'
        expect(await comparePassword(testPassword, testHash)).toEqual(false)
    });

    test('expect password to get hashed and then compare again', async () => {
        const testPassword = 'BoiledCabbage'
        const testHash = await hashPassword(testPassword)
        expect(await comparePassword(testPassword, testHash)).toEqual(true)
    });
})


describe('secure code generation', () => {
    const secureCode = generateSecureCode()

    test('secure code is a string', () => {
        expect(typeof secureCode === 'string')
    })

    test('secure code is 8 characters long', () => {
        expect(secureCode.length === 8)
    })

    test('secure code is alphanumeric', () => {
        expect(/^[0-9A-F]+$/.test(secureCode))
    })

    test('secure code is not null', () => {
        expect(secureCode !== null)
    })

    test('secure code is not undefined', () => {
        expect(secureCode !== undefined)
    })

    test('secure code is not empty', () => {
        expect(secureCode !== '')
    })

    test('secure code is not whitespace', () => {
        expect(secureCode.trim() !== '')
    })

    test('secure code is not empty', () => {
        expect(secureCode.trim() !== '')
    })
})

describe('jwt', () => {
    test('get user id from JWT', () => {
        const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Iml1czdxYnJ6eG5jZHdvNXpjZGRoYWtneSIsInVzZXJuYW1lIjoiam9zaGNvb3BlciIsImlhdCI6MTczODI0OTI3MywiZXhwIjoxNzM4MzM1NjczfQ._pjZD9ewZMMjZbCYwk09c2julbSSIW0QMUpkXyxdzxM'
        expect(getUserIdFromJWT(jwt)).toEqual('ius7qbrzxncdwo5zcddhakgy')
    })
})