import { Component, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { FibonacciInputComponent } from "./fibonacci-input";
import { FibonacciService, NumberFrequency } from '../modules/fibonacci-service';
import { Subscription } from "rxjs";


@Component({
    selector: 'app-fibonacci',
    imports: [CommonModule, FormsModule, FibonacciInputComponent],
    template: `
        <div class="w-full max-w-2xl mx-auto px-4">
        @if(finalResults) {
            <div class="bg-white rounded-xl shadow-lg p-8 border border-green-100">
                <div class="mb-6">
                    <h2 class="text-2xl font-bold text-green-800 mb-2">Final Results</h2>
                </div>
                <div class="overflow-hidden rounded-lg border border-gray-200 mb-3">
                    <table class="w-full border-collapse bg-white">
                        <thead class="bg-gradient-to-r from-green-50 to-emerald-50">
                            <tr>
                                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">Number</th>
                                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">Frequency</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            @for (item of finalResults; track item.number) {
                                <tr class="hover:bg-gray-50 transition-colors duration-150">
                                    <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ item.number }}</td>
                                    <td class="px-6 py-4 text-sm text-gray-700">{{ item.frequency }}</td>
                                </tr>
                            } @empty {
                                <tr>
                                    <td colspan="2" class="px-6 py-8 text-center text-gray-500 italic">No numbers were entered</td>
                                </tr>
                            }
                        </tbody>
                    </table>
                </div>
                <p class="text-green-700 mb-3">Thanks for playing. </p>
                <button 
                    class="w-full px-6 py-3 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer" 
                    (click)="reset()">
                    Start Over
                </button>
            </div>
        } @else if(!timerActive) {
            <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <label class="block text-sm font-medium text-gray-700 mb-2">Enter delay in seconds</label>
                <input 
                    type="number" 
                    class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                    [(ngModel)]="inputTimerSeconds" 
                    (keyup.enter)="startTimer()"
                    placeholder="Enter delay in seconds"
                    autofocus
                />
                <button 
                    class="mt-4 w-full px-6 py-3 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer" 
                    (click)="startTimer()">
                    Start Timer
                </button>
            </div>
        } @else {
            <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <app-fibonacci-input (numberSubmitted)="addNumber($event)" />

                <div class="mt-6 pt-6 border-t border-gray-200">
                    <div class="flex gap-3 justify-center">
                        @if (!halted) {
                            <button 
                                class="px-6 py-3 h-12 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer min-w-[120px]" 
                                (click)="halt()">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6 4h2v12H6V4zm6 0h2v12h-2V4z"/>
                                </svg>
                                Halt
                            </button>
                        }

                        @if (halted) {
                            <button 
                                class="px-6 py-3 h-12 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer min-w-[120px]" 
                                (click)="resume()">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6 4l8 6-8 6V4z"/>
                                </svg>
                                Resume
                            </button>
                        }

                        <button 
                            class="px-6 py-3 h-12 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer min-w-[120px]" 
                            (click)="stop()">
                            Quit
                        </button>
                    </div>
                </div>

                <div class="mt-8">
                    @if (numberFrequency.length > 0) {
                        <div class="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                            <table class="w-full border-collapse bg-white">
                                <thead class="bg-gradient-to-r from-gray-50 to-slate-50">
                                    <tr>
                                        <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 truncate">Number</th>
                                        <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">Frequency</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                    @for (item of numberFrequency; track item.number) {
                                        <tr class="hover:bg-gray-50 transition-colors duration-150">
                                            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ item.number }}</td>
                                            <td class="px-6 py-4 text-sm text-gray-700">{{ item.frequency }}</td>
                                        </tr>
                                    }
                                </tbody>
                            </table>
                        </div>
                    } @else {
                        <div class="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <p class="text-gray-500 text-lg">No numbers have been entered yet</p>
                        </div>
                    }
                </div>
            </div>
        }
        </div>
    `,
})

export class FibonacciComponent implements OnDestroy {
    public inputTimerSeconds: number | null = null;
    private sub = new Subscription();

    public timerActive: boolean = false;
    public halted: boolean = false;
    private service: FibonacciService;
    
    public numberFrequency: NumberFrequency[] = [];
    public finalResults: NumberFrequency[] | null = null;

    constructor(private cdr: ChangeDetectorRef) {
        this.service = new FibonacciService();
        
        this.sub.add(
            this.service.fibonacciFound$.subscribe(() => {
                // Better to display it as a toast or notification in a real application
                alert('FIB');
            })
        );
        this.sub.add(
            this.service.numberFrequencyEntry$.subscribe(entries => {
                this.numberFrequency = entries;
                this.cdr.markForCheck();
            })
        );
        this.sub.add(
            this.service.quit$.subscribe((results: NumberFrequency[]) => {
                this.timerActive = false;
                this.finalResults = results;
                this.cdr.markForCheck();
            })
        )
    }

    addNumber(n: bigint): void {
       this.service.addNumber(n);
    }

    startTimer(): void {
        if (!this.inputTimerSeconds || this.inputTimerSeconds <= 0) return;
        this.service.startTimer(this.inputTimerSeconds);
        this.timerActive = true;
    }

    halt() {
        this.halted = true;
        this.service.haltTimer();
    }

    resume() {  
        this.halted = false;
        this.service.resumeTimer();
    }

    stop() {
        this.service.quit();
    }

    reset() {
        this.finalResults = null;
        this.numberFrequency = [];
        this.inputTimerSeconds = null;
    }

    ngOnDestroy(): void {
        this.service.quit();
    }
}