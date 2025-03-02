import { select, selectSlice } from '@rx-angular/state/selections';
import { RxState } from '@rx-angular/state';
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { filter, map, Observable, startWith } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { fallbackRouteToDefault } from './routing-default.util';
import { RxInputType } from '../rxa-custom/input-type.typing';
import { coerceObservable } from '../utils/coerceObservable';
import { RouterParams } from './router.model';

/**
 * This service maintains the router state and repopulates it to its subscriber.
 */
@Injectable({
  providedIn: 'root',
})
export class RouterState extends RxState<RouterParams> {
  private _routerParams$: Observable<RouterParams> = this.router.events.pipe(
    select(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith('anyValue'),
      map((_) => {
        // This is a naive way to reduce scripting of router service :)
        // Obviously the params relay on routing structure heavily and could be done more dynamically
        const [layout, type, identifier] = fallbackRouteToDefault(
          new URL(
            this.document.location.href,
            /* On SSR pre-render the location data are relative paths instead of valid absolute URLs, that's why we need to construct a new URL, with explicit origin (substituted by mock if pre-rendering) and then only consume pathname as our routing location */
            this.document.location.origin || 'http://mock.domain'
          ).pathname
        )
          .split('/')
          .slice(-3);

        let sortBy: string | null = null;
        const [, queryParams]: (string | undefined)[] = fallbackRouteToDefault(
          this.document.location.search
        ).split('?');

        if (queryParams) {
          const [, sortByAndRest]: (string | undefined)[] =
            queryParams?.split('sort_by=');
          sortBy = sortByAndRest?.split('&')?.shift() || null;
        }
        return { layout, type, identifier, sortBy };
      }),
      // emits if all values are given and set. (filters out undefined values and will not emit if one is undefined)
      selectSlice(['layout', 'identifier', 'type', 'sortBy'])
    )
  ) as unknown as Observable<RouterParams>;
  routerParams$ = this.select();

  setOptions(options: RxInputType<Record<string, string>>) {
    this.hold(coerceObservable(options), (queryParams) =>
      this.router.navigate([], { queryParams })
    );
  }

  constructor(
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {
    super();
    this.connect(this._routerParams$);
  }
}
