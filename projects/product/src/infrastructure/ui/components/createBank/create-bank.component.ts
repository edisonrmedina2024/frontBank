import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  map,
  Observable,
  of,
  Subject,
  Subscription,
  takeUntil,
} from 'rxjs';
import { CreateProductUseCase } from '../../../../application/create.product.use.case';
import { GetSelectedProductCase } from '../../../../application/getSelectedProductCase';
import { ProductExistsUseCase } from '../../../../application/product.exists.use.case';
import { UpdateProductUseCase } from '../../../../application/update.product.use.case';
import { IProduct } from '../../../../domain/model/IProduct';
import { ProductQuery } from '../../../../domain/state/product.query';
import { ButtonBankComponent } from '../button.Bank/button.component';
import { InputBankComponent } from '../input-bank/input-bank.component';

@Component({
  selector: 'lib-modal-bank',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputBankComponent,
    ButtonBankComponent,
  ],
  templateUrl: './create-bank.component.html',
  styleUrls: ['./create-bank.component.css'],
})
export class BankComponent implements OnDestroy, OnInit {
  @Output() closeModal = new EventEmitter<void>();
  @Output() submit = new EventEmitter<any>();
  @Input() productToEdit: IProduct | null = null;

  private fb = inject(FormBuilder);
  private _validateIdUseCase = inject(ProductExistsUseCase);
  private _createProductUseCase = inject(CreateProductUseCase);
  private _editProductUseCase = inject(UpdateProductUseCase);
  private _getSelectedProductUseCase = inject(GetSelectedProductCase);
  private readonly _destroy$ = new Subject<void>();
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly _queries = inject(ProductQuery);
  private readonly _subscription = new Subscription();
  translations: { [key: string]: string } = {};

  productForm!: FormGroup;
  today = new Date().toISOString().split('T')[0];
  isEditMode: boolean = false;

  constructor() {
    this._subscription.add(
      this._queries.selectTranslations().subscribe((translations) => {
        this.translations = translations;
        console.log('translations', translations);
      })
    );
  }

  ngOnInit(): void {
    this.initForm();
    debugger;

    this._route.queryParams.subscribe((params) => {
      const isEditMode = params['mode'] === 'edit';

      if (isEditMode) {
        this.isEditMode = true;
        this._getSelectedProductUseCase.execute().subscribe((product) => {
          this.productToEdit = product;
        });

        if (this.productToEdit) {
          this.populateFormForEditing();
        } else {
          console.warn('No hay producto seleccionado en el store para editar.');
        }
      }
    });
  }

  public populateFormForEditing(): void {
    if (!this.productToEdit) return;

    this.productForm.get('id')?.disable();

    this.productForm.patchValue({
      id: this.productToEdit.id,
      name: this.productToEdit.name,
      description: this.productToEdit.description,
      logo: this.productToEdit.logo,
      date_release: this.formatDateForInput(this.productToEdit.date_release),
      date_revision: this.formatDateForInput(this.productToEdit.date_revision),
    });
  }

  private formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      id: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(10),
        ],
        this.validateIdExistAsync.bind(this),
      ],
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(100),
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(200),
        ],
      ],
      logo: ['', Validators.required],
      date_release: [
        this.today,
        [Validators.required, this.validateReleaseDate],
      ],
      date_revision: [{ value: '', disabled: true }, [Validators.required]],
    });

    this.productForm.controls['date_release'].valueChanges.subscribe(
      (value) => {
        if (value) {
          const releaseDate = new Date(value);
          releaseDate.setFullYear(releaseDate.getFullYear() + 1);
          this.productForm.controls['date_revision'].setValue(
            releaseDate.toISOString().split('T')[0]
          );
        }
      }
    );
  }

  validateReleaseDate(control: FormControl) {
    const today = new Date().toISOString().split('T')[0];
    return control.value >= today ? null : { invalidDate: true };
  }

  submitForm(): void {
    if (this.productForm.valid) {
      this.productForm.controls['date_revision'].enable();
      const productData = this.productForm.value;

      if (this.isEditMode) {
        this.productForm.get('id')?.enable();
        const updateProductData = { ...productData, id: this.productForm.get('id').value };
        this._editProductUseCase
          .execute(updateProductData)
          .pipe(takeUntil(this._destroy$))
          .subscribe({
            next: (response) => {
              this.resetForm();
              this.closeModal.emit();
            },
            error: (error) => {
              console.error('Error al editar el producto', error);
            },
          });
      } else {
        this._createProductUseCase
          .execute(productData)
          .pipe(takeUntil(this._destroy$))
          .subscribe({
            next: (response) => {
              this._router.navigate(['/design/2']);
              this.resetForm();
              this.closeModal.emit();
            },
            error: (error) => {
              console.error('Error al crear el producto', error);
            },
          });
      }
    } else {
      this.productForm.markAllAsTouched();
    }
  }

  resetForm(): void {
    if (this.isEditMode) {
      this._router.navigate(['/design/2']);
    } else {
      this.productForm.reset();
    }
  }

  validateIdExistAsync(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    console.log('validateIdExistAsync is running!');
    if (!control.value) return of(null);

    return this._validateIdUseCase.execute(control.value).pipe(
      takeUntil(this._destroy$),
      map((exists: boolean) => {
        console.log('validateIdExistAsync - Response from use case:', exists);
        const result = exists ? { idExists: true } : null;
        console.log('validateIdExistAsync - Result:', result); // Agrega esta línea
        this.cdr.detectChanges();
        return result;
      }),
      catchError(() => {
        this.cdr.detectChanges();
        return of(null);
      })
    );
  }

  closeModalBank() {
    this.closeModal.emit();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    this._destroy$.next();
    this._destroy$.complete();
  }
}
