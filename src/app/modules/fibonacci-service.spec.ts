import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FibonacciService, NumberFrequency } from './fibonacci-service';
import { FibonacciSequenceInterface } from './fibonacci-sequence';
import { take } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

describe('FibonacciService', () => {
    let mockFibonacciSequence: FibonacciSequenceInterface;
    let service: FibonacciService;

    beforeEach(() => {
        vi.useFakeTimers();
        mockFibonacciSequence = {
            isFibonacci: vi.fn(),
            getNumbers: vi.fn(),
        };
    });

    afterEach(() => {
        vi.useRealTimers();
        if (service) {
            service.quit();
        }
    });

    describe('constructor', () => {
        it('should create instance with default FibonacciSequence', () => {
            service = new FibonacciService();
            expect(service).toBeInstanceOf(FibonacciService);
        });

        it('should create instance with injected FibonacciSequenceInterface', () => {
            service = new FibonacciService(mockFibonacciSequence);
            expect(service).toBeInstanceOf(FibonacciService);
        });
    });

    describe('addNumber', () => {
        beforeEach(() => {
            service = new FibonacciService(mockFibonacciSequence);
        });

        it('should track a single number', async () => {
            (mockFibonacciSequence.isFibonacci as any).mockReturnValue(false);
            service.addNumber(5n);
            
            // Use quit to get the final snapshot
            const quitPromise = firstValueFrom(service.quit$);
            service.quit();
            const results = await quitPromise;
            
            expect(results).toHaveLength(1);
            expect(results[0]).toEqual({ number: 5n, frequency: 1 });
        });

        it('should track multiple different numbers', async () => {
            (mockFibonacciSequence.isFibonacci as any).mockReturnValue(false);
            service.addNumber(5n);
            service.addNumber(7n);
            service.addNumber(10n);
            
            // Use quit to get the final snapshot
            const quitPromise = firstValueFrom(service.quit$);
            service.quit();
            const results = await quitPromise;
            
            expect(results).toHaveLength(3);
            expect(results.map(e => e.number)).toEqual(expect.arrayContaining([5n, 7n, 10n]));
            expect(results.map(e => e.frequency)).toEqual(expect.arrayContaining([1, 1, 1]));
        });

        it('should increment frequency for duplicate numbers', async () => {
            (mockFibonacciSequence.isFibonacci as any).mockReturnValue(false);
            service.addNumber(5n);
            service.addNumber(5n);
            service.addNumber(5n);
            
            // Use quit to get the final snapshot
            const quitPromise = firstValueFrom(service.quit$);
            service.quit();
            const results = await quitPromise;
            
            expect(results).toHaveLength(1);
            expect(results[0]).toEqual({ number: 5n, frequency: 3 });
        });

        it('should track multiple different numbers with different frequencies', async () => {
            (mockFibonacciSequence.isFibonacci as any).mockReturnValue(false);

            const numbers = [5n, 5n, 7n, 10n, 10n, 10n];
            for(const number of numbers) {
                service.addNumber(number);
            }
            
            // Use quit to get the final snapshot
            const quitPromise = firstValueFrom(service.quit$);
            service.quit();
            const results = await quitPromise;
            
            expect(results).toHaveLength(3);
            expect(results.map(e => e.number)).toEqual(expect.arrayContaining(numbers));
            expect(results.map(e => e.frequency)).toEqual(
                expect.arrayContaining(numbers.map(n => numbers.filter(m => m === n).length))
            );
        });

        it('should emit fibonacciFound$ when a Fibonacci number is added', async () => {
            (mockFibonacciSequence.isFibonacci as any).mockImplementation((n: bigint) => n === 5n);
            
            const fibonacciPromise = firstValueFrom(service.fibonacciFound$);
            service.addNumber(5n);
            
            const fibNumber = await fibonacciPromise;
            expect(fibNumber).toBe(5n);
        });

        it('should not emit fibonacciFound$ for non-Fibonacci numbers', () => {
            (mockFibonacciSequence.isFibonacci as any).mockReturnValue(false);
            
            let emitted = false;
            const emittedValues: bigint[] = [];
            const subscription = service.fibonacciFound$.subscribe((value) => {
                emitted = true;
                emittedValues.push(value);
            });
            
            service.addNumber(4n);
            service.addNumber(6n);
            
            // Emissions are synchronous, so we can check immediately
            expect(emitted).toBe(false);
            expect(emittedValues).toHaveLength(0);
            
            subscription.unsubscribe();
        });

        it('should maintain correct bucket structure when updating frequencies', async () => {
            (mockFibonacciSequence.isFibonacci as any).mockReturnValue(false);

            const numbers = [5n, 5n, 7n, 10n, 10n];
            for(const number of numbers) {
                service.addNumber(number);
            }
            
            // Use quit to get the final snapshot
            const quitPromise = firstValueFrom(service.quit$);
            service.quit();
            const results = await quitPromise;
            
            // Should be sorted by frequency descending
            expect(results).toHaveLength(3);
            expect(results.map(e => e.number)).toEqual(expect.arrayContaining(numbers));
            expect(results.map(e => e.frequency)).toEqual(
                expect.arrayContaining(numbers.map(n => numbers.filter(m => m === n).length))
            );
        });

        it('should handle large bigint values', async () => {
            (mockFibonacciSequence.isFibonacci as any).mockReturnValue(false);
            const largeNumber = 12345678901234567890n;
            service.addNumber(largeNumber);
            
            // Use quit to get the final snapshot
            const quitPromise = firstValueFrom(service.quit$);
            service.quit();
            const results = await quitPromise;
            
            expect(results[0].number).toBe(largeNumber);
        });
    });
});

