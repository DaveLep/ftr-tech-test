import { FibonacciSequence, FibonacciSequenceInterface } from "./fibonacci-sequence";
import { switchMap, tap } from "rxjs/operators";
import { BehaviorSubject, Subject, Subscription, timer, NEVER } from "rxjs";

export interface NumberFrequency {
    number: bigint;
    frequency: number;
}

export class FibonacciService {
    private readonly fibonacciSequence: FibonacciSequenceInterface;
    // state
    private numbers: Map<bigint, number> = new Map();
    private buckets: Map<number, Set<bigint>> = new Map();

    // timer
    private timerDelayMs: number = 0;
    private accumulatedTimeMs: number = 0;
    private lastTickTime: number = 0;
    
    private timerSubscription: Subscription = new Subscription();

    // Observables
    private isTimerRunningSubject = new BehaviorSubject<boolean>(false);
    public isTimerRunning$ = this.isTimerRunningSubject.asObservable();

    private numberFrequencyEntrySubject = new BehaviorSubject<NumberFrequency[]>([]);
    public numberFrequencyEntry$ = this.numberFrequencyEntrySubject.asObservable();

    private fibonacciFoundSubject = new Subject<bigint>();
    public fibonacciFound$ = this.fibonacciFoundSubject.asObservable();

    private quitSubject = new Subject<NumberFrequency[]>();
    public quit$ = this.quitSubject.asObservable();
    
    constructor(fibonacciSequence: FibonacciSequenceInterface = new FibonacciSequence()) {
        this.fibonacciSequence = fibonacciSequence;
        this.setupTimerStream();
    }

    private setupTimerStream(): void {
        this.timerSubscription.add(
            this.isTimerRunning$.pipe(
                switchMap(isRunning => {
                    if(isRunning) {
                        this.lastTickTime = Date.now();
                        const remainingTime = this.timerDelayMs - this.accumulatedTimeMs;

                        return timer(remainingTime, this.timerDelayMs).pipe(
                            tap(() => {
                                this.accumulatedTimeMs = 0;
                                this.lastTickTime = Date.now();
                                
                                this.emitFrequencySnapshot();
                            })
                        );
                    }
                    return NEVER; 
                })
            ).subscribe()
        );
    }

    /**
     * Maintain numbers pre-grouped by frequency to avoid sorting on each snapshot.
     * - numbers: a map of numbers -> frequency count 
     *   Example: { 5: 2, 7: 1, 10: 2 } means 5 appears twice, 7 once, 10 twice
     * 
     * - buckets: Map of frequency -> Set of numbers with that frequency
     *   Example: { 1: Set{7}, 2: Set{5, 10} } groups numbers by their frequency
     * 
     * This avoids sorting the numbers map on each iteration, we only sort the keys of the buckets.
    */
    addNumber(n: bigint): void {
        if(this.fibonacciSequence.isFibonacci(n)) {
            this.fibonacciFoundSubject.next(n);
        }

        const existingCount = this.numbers.get(n) ?? 0;
        const newCount = existingCount + 1;

        this.numbers.set(n, newCount);

        if(existingCount > 0) {
            const oldSet = this.buckets.get(existingCount);

            if(oldSet !== undefined) {
                oldSet.delete(n);
                if(oldSet.size === 0) {
                    this.buckets.delete(existingCount);
                }
            }
        }

        // Check if there is already a bucket (a Set) for numbers with the new count (newCount).
        // If not, create a new Set for this count and add it to the buckets map.
        if(! this.buckets.has(newCount)) {
            this.buckets.set(newCount, new Set<bigint>());
        }
        // Add the number (n) to the set corresponding to its new count.
        this.buckets.get(newCount)!.add(n);
    }

    startTimer(seconds: number): void {
        // Recreate subscription if it was closed (e.g., after quit)
        if (this.timerSubscription.closed) {
            this.timerSubscription = new Subscription();
            this.setupTimerStream();
        }
        
        this.timerDelayMs = seconds * 1000;
        this.accumulatedTimeMs = 0;
        
        this.isTimerRunningSubject.next(true);
    }

    haltTimer(): void {
        if (this.isTimerRunningSubject.value) {
            const now = Date.now();
            const elapsed = now - this.lastTickTime;
            
            this.accumulatedTimeMs += elapsed;
        }

        this.isTimerRunningSubject.next(false);
    }

    resumeTimer(): void {
        this.lastTickTime = Date.now();
        this.isTimerRunningSubject.next(true);
    }

    quit(): void {
        this.isTimerRunningSubject.next(false);
        
        // emit the final results and clear the data
        this.quitSubject.next(this.buildFrequencySnapshot());

        // Clear all data
        this.numbers.clear();
        this.buckets.clear();
        this.numberFrequencyEntrySubject.next([]);
        
        // Reset timer state
        this.timerDelayMs = 0;
        this.timerSubscription.unsubscribe();
    }

    private buildFrequencySnapshot(): NumberFrequency[] {
        const snapshot: NumberFrequency[] = [];
        // sort only the bucket keys to avoid iterating unnecessarily when the distribution of number frequencies is large
        const startTime = performance.now();
        const counts = Array.from(this.buckets.keys()).sort((a, b) => b - a);


        for(const count of counts) {            
            const set = this.buckets.get(count);
            if(! set) continue;

            for(const num of set) {
                snapshot.push({ number: num, frequency: count });
            }
        }
        const endTime = performance.now();
        const elapsedTime = endTime - startTime;
        console.log(`buildFrequencySnapshot took ${elapsedTime}ms`);

        return snapshot;
    }

    private emitFrequencySnapshot() {
        this.numberFrequencyEntrySubject.next(this.buildFrequencySnapshot());
    }
}
