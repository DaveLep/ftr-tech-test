import { describe, it, expect, beforeEach } from 'vitest';
import { FibonacciSequence } from './fibonacci-sequence';

describe('FibonacciSequence', () => {
    describe('constructor', () => {
        it('should create instance with default totalNumbers', () => {
            const sequence = new FibonacciSequence();
            expect(sequence.getNumbers().size).toBe(999);
            expect(sequence).toBeInstanceOf(FibonacciSequence);
        });

        it('should create instance with custom totalNumbers', () => {
            const sequence = new FibonacciSequence(10);
            expect(sequence.getNumbers().size).toBe(9);
            expect(sequence).toBeInstanceOf(FibonacciSequence);
        });

        it('should throw error for non-integer totalNumbers', () => {
            expect(() => new FibonacciSequence(10.5)).toThrow('Total numbers must be a positive integer');
        });

        it('should throw error for zero totalNumbers', () => {
            expect(() => new FibonacciSequence(0)).toThrow('Total numbers must be a positive integer');
        });

        it('should throw error for negative totalNumbers', () => {
            expect(() => new FibonacciSequence(-5)).toThrow('Total numbers must be a positive integer');
        });

        it('should throw error for totalNumbers greater than 10000', () => {
            expect(() => new FibonacciSequence(10001)).toThrow('Total numbers must be less than or equal to 10000');
        });
    });

    describe('generate', () => {
        it('should generate first Fibonacci number correctly', () => {
            const sequence = new FibonacciSequence(1);
            expect(sequence.isFibonacci(0n)).toBe(true);
            expect(sequence.isFibonacci(1n)).toBe(false);
        });

        it('should generate first 2 Fibonacci numbers correctly', () => {
            const sequence = new FibonacciSequence(2);
            expect(sequence.isFibonacci(0n)).toBe(true);
            expect(sequence.isFibonacci(1n)).toBe(true);
            expect(sequence.isFibonacci(2n)).toBe(false);
        });

        it('should generate first 10 Fibonacci numbers correctly', () => {
            const sequence = new FibonacciSequence(10);
            // First 10 Fibonacci numbers: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34
            expect(sequence.isFibonacci(0n)).toBe(true);
            expect(sequence.isFibonacci(1n)).toBe(true);
            expect(sequence.isFibonacci(2n)).toBe(true);
            expect(sequence.isFibonacci(3n)).toBe(true);
            expect(sequence.isFibonacci(5n)).toBe(true);
            expect(sequence.isFibonacci(8n)).toBe(true);
            expect(sequence.isFibonacci(13n)).toBe(true);
            expect(sequence.isFibonacci(21n)).toBe(true);
            expect(sequence.isFibonacci(34n)).toBe(true);
        });

        it('should generate large Fibonacci numbers correctly', () => {
            const sequence = new FibonacciSequence(100);
            // Some larger Fibonacci numbers
            expect(sequence.isFibonacci(55n)).toBe(true);
            expect(sequence.isFibonacci(89n)).toBe(true);
            expect(sequence.isFibonacci(144n)).toBe(true);
            expect(sequence.isFibonacci(233n)).toBe(true);
        });
    });

    describe('isFibonacci', () => {
        let sequence: FibonacciSequence;

        beforeEach(() => {
            sequence = new FibonacciSequence(100);
        });

        it('should return true for 0', () => {
            expect(sequence.isFibonacci(0n)).toBe(true);
        });

        it('should return true for 1', () => {
            expect(sequence.isFibonacci(1n)).toBe(true);
        });

        it('should return true for known Fibonacci numbers', () => {
            const knownFibs = [2n, 3n, 5n, 8n, 13n, 21n, 34n, 55n, 89n];
            knownFibs.forEach(fib => {
                expect(sequence.isFibonacci(fib)).toBe(true);
            });
        });

        it('should return false for non-Fibonacci numbers', () => {
            const nonFibs = [4n, 6n, 7n, 9n, 10n, 11n, 12n, 14n, 15n, 20n, 22n];
            nonFibs.forEach(nonFib => {
                expect(sequence.isFibonacci(nonFib)).toBe(false);
            });
        });

        it('should return false for numbers beyond the generated sequence', () => {
            const smallSequence = new FibonacciSequence(10);
            // 10th Fibonacci number is 34, so 55 should not be in the set
            expect(smallSequence.isFibonacci(55n)).toBe(false);

            const largeSequence = new FibonacciSequence();
            const FibNumber1001 = 70330367711422815821835254877183549770181269836358732742604905087154537118196933579742249494562611733487750449241765991088186363265450223647106012053374121273867339111198139373125598767690091902245245323403501n;
            expect(largeSequence.isFibonacci(FibNumber1001)).toBe(false);
        });
    });
});

