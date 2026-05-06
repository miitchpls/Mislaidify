import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { provideRouter } from '@angular/router';
import { SESSION_VERIFIER_KEY } from '@constants';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let router: Router;

  const mockRoute = (queryParams: Record<string, string> = {}) =>
    ({ queryParams } as ActivatedRouteSnapshot);

  const mockState = {} as RouterStateSnapshot;

  const runGuard = (queryParams: Record<string, string> = {}) =>
    TestBed.runInInjectionContext(() => authGuard(mockRoute(queryParams), mockState));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    router = TestBed.inject(Router);
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('when error param is present', () => {
    it('redirects to /', () => {
      const result = runGuard({ error: 'access_denied' });
      expect(result).toEqual(router.createUrlTree(['/']));
    });

    it('redirects to / even if code is also present', () => {
      const result = runGuard({ error: 'access_denied', code: 'some-code' });
      expect(result).toEqual(router.createUrlTree(['/']));
    });
  });

  describe('when code param is present', () => {
    it('allows access', () => {
      const result = runGuard({ code: 'AQDqUCcG' });
      expect(result).toBe(true);
    });
  });

  describe('when verifier is in sessionStorage', () => {
    it('allows access', () => {
      sessionStorage.setItem(SESSION_VERIFIER_KEY, 'some-verifier');
      const result = runGuard();
      expect(result).toBe(true);
    });
  });

  describe('when no code, no error, and no verifier', () => {
    it('redirects to /', () => {
      const result = runGuard();
      expect(result).toEqual(router.createUrlTree(['/']));
    });
  });
});
