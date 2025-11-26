import { Component } from '@angular/core';
import { FibonacciComponent } from './components/fibonacci';

@Component({
    selector: 'app-root',
    template: `
    	<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col items-center justify-center py-12 px-4">
      		<h1 class="text-5xl font-bold mb-12 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">Fibonacci</h1>
      		<app-fibonacci />
    	</div>
  	`,
    styles: [],
    imports: [FibonacciComponent],
})
export class App { }
