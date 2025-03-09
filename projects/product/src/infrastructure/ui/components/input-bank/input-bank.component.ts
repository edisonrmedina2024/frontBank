import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-input-bank',
  imports: [CommonModule,FormsModule],
  templateUrl: './input-bank.component.html',
  styleUrl: './input-bank.component.css'
})
export class InputBankComponent {
  searchTerm: string = '';
  
  @Output() searchChange = new EventEmitter<string>();
  
  search(): void {
    this.searchChange.emit(this.searchTerm);
  }

}
