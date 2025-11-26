import { Component, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef } from "@angular/core";
import { FormsModule } from "@angular/forms";

type BigIntValidationResult =
  | { valid: true; value: bigint }
  | { valid: false; error: string };

@Component({
    selector: 'app-fibonacci-input',
    standalone: true,
    imports: [FormsModule],
    template: `
        <div class="w-full">
            <div class="flex gap-3 items-start">
                <div class="flex-1">
                    <input 
                        #fibInput
                        type="text" 
                        class="w-full border-2 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 placeholder-gray-400"
                        [class.border-gray-300]="!errorMessage"
                        [class.border-red-400]="errorMessage"
                        [class.focus:ring-red-500]="errorMessage"
                        [class.focus:ring-blue-500]="!errorMessage"
                        [class.focus:border-transparent]="true"
                        [(ngModel)]="numberInput" 
                        (input)="clearError()"
                        (keyup.enter)="submitNumber()" 
                        placeholder="Enter a number" 
                        inputmode="numeric"
                    />
                    @if(errorMessage) {
                        <p class="mt-2 text-sm text-red-600 font-medium flex items-center gap-1">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                            </svg>
                            {{ errorMessage }}
                        </p>
                    }
                </div>
                <button 
                    class="px-6 py-3 h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer whitespace-nowrap flex items-center justify-center" 
                    (click)="submitNumber()">
                    Add Number
                </button>
            </div>
        </div>
    `,
})

export class FibonacciInputComponent {
    @ViewChild('fibInput') fibInput!: ElementRef<HTMLInputElement>;

    ngAfterViewInit(): void {
        this.fibInput.nativeElement.focus();
    }

    @Output() numberSubmitted = new EventEmitter<bigint>();

    errorMessage: string | null = null;
    numberInput: string = '';

    submitNumber() {
        const result = this.validateNumberInput(this.numberInput);
        
        if(result.valid) {
            this.numberSubmitted.emit(result.value);
            this.numberInput = '';
            return;
        }

        this.errorMessage = result.error;
    }

    clearError(): void {
        this.errorMessage = null;
    }

    validateNumberInput(input: string): BigIntValidationResult {
        const trimmed = input.trim();
        if(!trimmed || trimmed === '') return { valid: false, error: 'Enter a number' };

        if(!/^\d+$/.test(trimmed)) return { valid: false, error: 'Enter a valid number' };

        try {
            const value = BigInt(trimmed);

            if(value <= 0) return { valid: false, error: 'Enter a positive number' };
            return { valid: true, value: value };
        } catch (e) {
            return { valid: false, error: 'Enter a positive number' };
        }
    }
}