import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanMatch, GuardResult, MaybeAsync, Route, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { AuthService } from '../services/auth-services';
import { map, tap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanMatch, CanActivate{

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {

  }

  private checkAuthStatus(): MaybeAsync<GuardResult>{
    return this.authService.checkAuthentication()
      .pipe(
        map(isAuthenticated => {
          if (isAuthenticated) {
            return true;
          } else {
            return this.router.createUrlTree(['./auth/login']);
          }
        })
      );
  }

  canMatch(route: Route, segments: UrlSegment[]): MaybeAsync<GuardResult> {
    // console.log('Can Match')
    // console.log(route, segments);

    return this.checkAuthStatus();
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    // console.log('Can activate')
    // console.log(route, state);

    return this.checkAuthStatus();
  }



}
