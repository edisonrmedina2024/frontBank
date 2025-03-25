/*
 * Public API Surface of shared
 */

export * from './domain/model/error.mesage';
export * from './domain/model/ICreateProductRequest';
export * from './domain/model/ICreateProductResponse';
export * from './domain/model/IDeleteProductResponse';
export * from './domain/model/IGetProductsResponse';
export * from './domain/model/IProduct';
export * from './domain/model/IProductExistsResponse';
export * from './domain/model/IProductState';
export * from './domain/model/ITransalator';
export * from './domain/model/IUpdateProductRequest';
export * from './domain/model/IUpdateProductResponse';
export * from './domain/model/IUseCase';
export * from './domain/state/product.query';
export * from './infrastructure/environments/environment.dev';
export * from './infrastructure/services/error.handle.service';
export * from './infrastructure/services/I18nTranslator.service';
export * from './infrastructure/services/product.store.service';
export * from './infrastructure/ui/components/rootshared/rootshared.component';
export * from './infrastructure/ui/components/skeleton/skeleton.component';
export * from './infrastructure/ui/interfaces/TranslationMapItem';
export * from './infrastructure/ui/interfaces/translationsMap';

