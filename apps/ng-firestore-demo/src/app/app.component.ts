import { Component } from '@angular/core';
import { NgFirestore } from 'ng-firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

class UserDoc {
  firstName = '';
  lastName = '';
  age?: number = undefined;
}

class User extends UserDoc {}

@Component({
  selector: 'ng-firestore-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  userResource = this.ngFirestore.getDataResource<User>(
    'users',
    User
  );

  form = this.ngFirestore.getDataResourceForm(
    this.userResource,
    User
  );

  allUsers$ = this.userResource.getALl();

  routeId$ = this.route.queryParamMap.pipe(
    map((query) => query.get('id'))
  );

  setRouteId(id: string | null) {
    this.router.navigate([], {
      queryParams: { id },
      replaceUrl: true,
    });
  }

  async save() {
    await this.form.save();
    this.setRouteId(null);
  }

  edit(id: string) {
    this.setRouteId(id);
  }

  constructor(
    private ngFirestore: NgFirestore,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.routeId$.subscribe((id) => {
      if (id !== this.userResource.getId()) {
        this.form.loadNewResource(id);
      }
    });
  }
}
