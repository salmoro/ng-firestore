import { Inject, Injectable, Type } from '@angular/core';
import {
  FIRESTORE,
  NgFirestoreModule,
} from './ng-firestore.module';
import {
  Firestore,
  WhereFilterOp,
  collection,
  doc,
  setDoc,
  where,
  orderBy,
  limit,
  query,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  BehaviorSubject,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { collection as rxCollection } from 'rxfire/firestore';
import firebase from 'firebase/compat';
import SetOptions = firebase.firestore.SetOptions;
import { DataResourceForm } from './data-resource-form';

type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

export type CollectionQuery<
  M extends Record<string, any>,
  K extends '__name__' | keyof M = keyof M
> = [K, WhereFilterOp, string | number];

@Injectable({ providedIn: NgFirestoreModule })
export class NgFirestore {
  constructor(
    @Inject(FIRESTORE) private firestore: Firestore
  ) {}

  getDataResource<
    D extends Record<string, any> = Record<string, any>,
    M extends D & { id?: string } = D & { id?: string }
  >(path: string, model: Type<M>, id?: string) {
    return new DataResource<D, M>(
      this.firestore,
      path,
      model,
      id
    );
  }

  getDataResourceForm<
    M extends Record<string, any> = Record<string, any>
  >(resource: DataResource<M, M>, model: Type<M>) {
    return new DataResourceForm(resource, model);
  }
}

export class DataResource<
  D extends Record<string, any>,
  M extends D & { id?: string }
> {
  private collection = collection(
    this.firestore,
    this.path
  );

  private id = new BehaviorSubject<
    null | undefined | string
  >(null);

  constructor(
    private firestore: Firestore,
    private path: string,
    private model: Type<M>,
    id?: string
  ) {
    this.setId(id);
  }

  setId(id?: string | null) {
    this.id.next(id);
  }

  getId() {
    return this.id.getValue();
  }

  add(data: M) {
    return addDoc(this.collection, data);
  }

  update(data: DeepPartial<M>, id: string) {
    return this.set(data, id, { merge: true });
  }

  set(
    data: DeepPartial<M>,
    id = this.getId(),
    options: SetOptions = {}
  ) {
    if (!id) {
      throw new Error(
        `No ID for updating resource at ${this.path}`
      );
    }

    const docRef = doc(
      this.firestore,
      `${this.path}/${id}`
    );

    return setDoc(docRef, data, options).then(() => docRef);
  }

  get(id?: string) {
    return (id ? of(id) : this.id.asObservable()).pipe(
      switchMap((id) =>
        !id
          ? of(null)
          : this.getALl({
              queries: [['__name__', '==', id]],
            }).pipe(
              map((res) => (res.length ? res[0] : null))
            )
      )
    );
  }

  getALl(
    props: {
      queries?: CollectionQuery<D>[];
      limit?: number;
      sort?: { by: keyof D; dir?: 'asc' | 'desc' }[];
    } = {}
  ): Observable<(D & { id: string })[]> {
    const queries = (props.queries || []).map((q) =>
      where(...(q as CollectionQuery<Record<string, any>>))
    );
    const sorts = (props.sort || []).map((s) =>
      orderBy(s.by as string, s.dir || 'asc')
    );
    const limits = props.limit ? [limit(props.limit)] : [];

    const q = query(
      this.collection,
      ...queries,
      ...sorts,
      ...limits
    );

    return rxCollection(q).pipe(
      map((changes) =>
        changes.map(
          (doc) =>
            Object.assign(new this.model(), doc.data(), {
              id: doc.id,
            }) as D & { id: string }
        )
      )
    );
  }

  delete(id = this.getId()) {
    if (!id) {
      throw new Error(
        `No ID for deleting resource at ${this.path}`
      );
    }

    const docRef = doc(
      this.firestore,
      `${this.path}/${id}`
    );

    return deleteDoc(docRef);
  }
}
