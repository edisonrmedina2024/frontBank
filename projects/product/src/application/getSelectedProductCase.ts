import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { IProduct } from '../domain/model/IProduct';
import { ProductQuery } from '../domain/state/product.query';
import { ErrorHandlingService } from '../infrastructure/services/error.handle.service';
import { ProductStoreService } from '../infrastructure/services/product.store.service';

@Injectable({
  providedIn: 'root',
})
export class GetSelectedProductCase {
  private readonly _query = inject(ProductQuery);
  private readonly _store = inject(ProductStoreService);
  private readonly _errorHandler = inject(ErrorHandlingService);

  execute(): Observable<IProduct | null> {
    this._store.setLoading(true);
    return this._query.selectSelectedProduct().pipe(
      catchError((err) => {
        console.error("Error getting selected product:", err);
        return this._errorHandler.handleError(err, "Error getting selected product")
      }),
      finalize(() => {
        this._store.setLoading(false);
      })
    );
  }
}