import { Directive, ElementRef } from '@angular/core';
import { supportsImageLoading } from '../../shared/utils/supports-image-loading';

declare const ngDevMode: boolean;

/**
 * **🚀 Perf Tip for LCP, TTI:**
 * To get out the best performance use the native HTML attribute instead of directives.
 * This avoids bootstrap and template evaluation time.
 */
@Directive({
  /* eslint-disable-next-line @angular-eslint/directive-selector */
  selector: 'img'
})
export class LazyImgDirective {
  constructor({ nativeElement }: ElementRef) {

    if (supportsImageLoading) {
      /**
       * **🚀 Perf Tip for LCP:**
       *
       * Apply the `loading` attribute and set it to lazy for all images in the application.
       * Notice for images above-the-fold it would be a bit counter productive as the fetching happens with a lower priority if `loading` is set to lazy.
       */
      nativeElement.setAttribute('loading', 'lazy');
    }
    /**
     * **🚀 Perf Tip for LCP:**
     *
     * if you guard a code block with `ngDevMode` the Angular compiler will remove it in the production build
     */
    else if (ngDevMode) {
      console.warn('The Browser does not support the loading attribute on images. Consider using IntersectionObserver (https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)');
    }
  }
}
