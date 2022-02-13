

# NgFirestore
An opinionated library for easily integrating Firestore data with Angular and Angular Forms

Installation
```bash
npm install ng-firestore
```
```bash
yarn add ng-firestore
```

example:
app.module.ts
```ts
@NgModule({
    declarations: [...],
    imports: [
        ...,
        NgFirestoreModule.initialize(environment.firebase),
    ],
})

```

app.component.ts
```ts

// Class should be initialized with empty values, otherwise typescript will remove those properties
class User {
  firstName = '';
  lastName = '';
  age?: number = undefined;
}

class AppComponent {
  constructor(private ngFirestore: NgFirestore) { }

  userResource = this.ngFirestore.getDataResource<User>(
    'users',
    User
  );

  form = this.ngFirestore.getDataResourceForm(
    this.userResource,
    User
  );
}
```

app.component.html
```html
<form [formGroup]="form.ngForm" (ngSubmit)="form.save()">
  <input
    [formControl]="form.ngForm.get('firstName')"
  />
  <input
    [formControl]="form.ngForm.get('lastName')"
  />
  <input
    [formControl]="form.ngForm.get('age')"
    type="number"
  />
  <button>Save</button>
</form>

<ul>
  <li *ngFor="let user of userResource.getAll() | async">
    {{ user.firstName }} {{ user.lastName }},
    {{ user.age }}
    <button (click)="form.loadNewResource(user.id)">
      EDIT
    </button>
    <button (click)="userResource.delete(user.id)">
      DELETE
    </button>
  </li>
</ul>
```
