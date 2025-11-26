export interface FibonacciSequenceInterface {
    isFibonacci(number: bigint): boolean;
    getNumbers(): Set<bigint>;
}

export class FibonacciSequence implements FibonacciSequenceInterface {
    private readonly DEFAULT_FIB_NUMBERS = 1000;
    private readonly MAX_FIB_SEQUENCE_SIZE = 10000; // I guess we should include some kind of upper limit...

    private fibonacciNumbers: Set<bigint>;

    constructor(totalNumbers: number = this.DEFAULT_FIB_NUMBERS) {
        if (! Number.isInteger(totalNumbers) || totalNumbers <= 0) {
            throw new Error("Total numbers must be a positive integer");
        }

        if (totalNumbers > this.MAX_FIB_SEQUENCE_SIZE) {
            throw new Error(`Total numbers must be less than or equal to ${this.MAX_FIB_SEQUENCE_SIZE}`);
        }

        this.fibonacciNumbers = this.generate(totalNumbers);
    }

    private generate(totalNumbers: number): Set<bigint> {
        const numbers = new Set<bigint>();

        if (totalNumbers <= 0) return numbers;
        numbers.add(0n);
        if(totalNumbers === 1) return numbers;
        numbers.add(1n);

        let lastNumber: bigint = 1n;
        let secondLastNumber: bigint = 0n;

        for (let i = 2; i < totalNumbers; i++) {
            const nextNumber = lastNumber + secondLastNumber;
            secondLastNumber = lastNumber;
            lastNumber = nextNumber;

            numbers.add(nextNumber);
        }

        return numbers;
    }

    public getNumbers(): Set<bigint> {
        return this.fibonacciNumbers;
    }

    public isFibonacci(number: bigint): boolean {
        return this.fibonacciNumbers.has(number);
    }
}