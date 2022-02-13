import { DataResource } from './data-resource';
import { Type } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

export interface DataResourceFormOptions {
  disableWhenLoading?: boolean;
  disableWhenSaving?: boolean;
}

const defaultOptions: DataResourceFormOptions = {
  disableWhenLoading: true,
  disableWhenSaving: true,
};

export class DataResourceForm<
  M extends Record<string, any> = Record<string, any>
> {
  constructor(
    private resource: DataResource<M, M>,
    private model: Type<M>,
    private options: DataResourceFormOptions = {}
  ) {
    this.initialize();
  }

  private _isLoading = new BehaviorSubject(false);
  private _isSaving = new BehaviorSubject(false);

  isLoading$ = this._isLoading.asObservable();
  isSaving$ = this._isSaving.asObservable();

  get isLoading() {
    return this._isLoading.getValue();
  }

  get isSaving() {
    return this._isSaving.getValue();
  }

  private _isNew =
    this.resource.getId() !== null &&
    this.resource.getId() !== undefined;

  get isNew() {
    return this._isNew;
  }

  readonly ngForm = new FormGroup(
    Object.entries(new this.model()).reduce(
      (controls, [key, val]) => ({
        ...controls,
        [key]: new FormControl(val),
      }),
      {} as { [key: string]: FormControl }
    )
  );

  setOptions(options: Partial<DataResourceFormOptions>) {
    this.options = { ...this.options, ...options };
  }

  getOptions(): DataResourceFormOptions {
    return { ...defaultOptions, ...this.options };
  }

  async save() {
    this.setIsSavingState(true);
    const data = this.ngForm.value;
    const id = this.resource.getId();

    const savePromise = id
      ? this.resource.update(data, id)
      : this.resource.add(data);

    const docRef = await savePromise.finally(() =>
      this.setIsSavingState(false)
    );

    if (!this.resource.getId()) {
      this.resource.setId(docRef.id);
    }

    return docRef;
  }

  loadNewResource(id: string | null) {
    this.resource.setId(id);
    if (id) {
      this._isNew = false;
      this.loadData();
    } else {
      this.ngForm.patchValue(new this.model());
    }
  }

  private initialize() {
    if (this._isNew) {
      return;
    }

    this.loadData();
  }

  private loadData() {
    this.setIsLoadingState(true);

    firstValueFrom(this.resource.get())
      .finally(() => this.setIsLoadingState(false))
      .then((val) => {
        if (val) {
          this.ngForm.patchValue(val);
        }
      });
  }

  private setIsLoadingState(loading: boolean) {
    this._isLoading.next(loading);

    if (this.getOptions().disableWhenLoading) {
      this.setFormDisabledState(loading);
    }
  }

  private setIsSavingState(saving: boolean) {
    this._isSaving.next(saving);

    if (this.getOptions().disableWhenSaving) {
      this.setFormDisabledState(saving);
    }
  }

  private setFormDisabledState(disabled: boolean) {
    disabled ? this.ngForm.disable() : this.ngForm.enable();
  }
}
