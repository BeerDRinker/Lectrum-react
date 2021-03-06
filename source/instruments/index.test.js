import { sum, delay, getUniqueID, getFullApiUrl } from './index';
import { api, GROUP_ID } from '../config/api';

jest.setTimeout(10000);

describe('instruments: ', () => {
    test('sum function should be a function', () => {
        expect(sum).toBeInstanceOf(Function);
    });

    test('sum function should throw, when called with non-number type as second argument', () => {
        expect(() => sum(2, 'fuck')).toThrow();
    });

    test('sum function should throw, when called with non-number type as second argument', () => {
        expect(() => sum('fuck', 2)).toThrow();
    });

    test('sum function should return an addition of two arguments passed', () => {
        expect(sum(2, 3)).toBe(5);
        expect(sum(2, 8)).toMatchSnapshot();
    });

    test('delay function should return a resolved promice', async () => {
        await expect(delay()).resolves.toBe('A resolved promice!');
    });

    test('getUniqueID function should be a function', () => {
        expect(getUniqueID).toBeInstanceOf(Function);
    });

    test('getUniqueID function should throw, when called with non-number type as second argument', () => {
        expect(() => getUniqueID('fuck')).toThrow();
    });
    test('getUniqueID function should produce a string of a given length', () => {
        expect(typeof getUniqueID()).toBe('string');
        expect(getUniqueID(5)).toHaveLength(5);
        expect(getUniqueID(13)).toHaveLength(13);
    });
    test('getFullApiUrl function should produce a string of full API URL', () => {
        expect(typeof getFullApiUrl(api, GROUP_ID)).toBe('string');
    });

});
