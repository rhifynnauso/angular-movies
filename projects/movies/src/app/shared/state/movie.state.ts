import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { TMDBMovieModel } from '../../data-access/api/model/movie.model';
import { patch, RxState, toDictionary } from '@rx-angular/state';
import { optimizedFetch } from '../utils/optimized-fetch';
import { getActions } from '../rxa-custom/actions';
import { withLoadingEmission } from '../utils/withLoadingEmissions';
import { getMovie, getMovieCategory } from '../../data-access/api/resources/movie.resource';
import { PaginatedResult } from './typings';

export interface State {
  movies: Record<string, TMDBMovieModel>;
  moviesContext: boolean;
  categoryMovies: Record<string, PaginatedResult<TMDBMovieModel>>;
  categoryMoviesContext: boolean;
}

interface Actions {
  fetchMovie: string;
  fetchCategoryMovies: { category: string };
}

@Injectable({
  providedIn: 'root'
})
export class MovieState extends RxState<State> {
  private actions = getActions<Actions>();

  fetchMovie = this.actions.fetchMovie;
  fetchCategoryMovies = this.actions.fetchCategoryMovies;

  constructor() {
    super();

    this.connect(
      this.actions.fetchMovie$.pipe(
        /**
         * **🚀 Perf Tip for TTI, TBT:**
         *
         * Avoid over fetching for HTTP get requests to URLs that will not change result quickly.
         * E.G.: URLs with the same params
         */
        optimizedFetch(
          (id) => id,
          (id) => {
            return getMovie(id).pipe(
              map(
                (result) => ({ movies: toDictionary([result], 'id') } as State)
              ),
              withLoadingEmission('moviesContext')
            );
          }
        )
      ),
      (oldState, newPartial) => {
        let s = newPartial as unknown as State;
        let resultState = patch(oldState, s);
        resultState.movies = patch(oldState?.movies, resultState.movies);
        return resultState;
      }
    );

    this.connect(
      this.actions.fetchCategoryMovies$.pipe(
        /**
         * **🚀 Perf Tip for TTI, TBT:**
         *
         * Avoid over fetching for HTTP get requests to URLs that will not change result quickly.
         */
        map(({ category }) => ({
          category
        })),
        optimizedFetch(
          ({ category }) => `category-${category}`,
          ({ category }) =>
            getMovieCategory(category).pipe(
              map((paginatedResult) => ({
                categoryMovies: { [category]: paginatedResult }
              })),
              withLoadingEmission('categoryMoviesContext')
            )
        )
      ),
      (oldState, newPartial) => {
        let s = newPartial as unknown as State;
        let resultState = patch(oldState, s);
        resultState.categoryMovies = patch(
          oldState?.categoryMovies,
          resultState.categoryMovies
        );
        return resultState;
      }
    );
  }
}
