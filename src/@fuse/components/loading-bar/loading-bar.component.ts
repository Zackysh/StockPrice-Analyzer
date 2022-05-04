import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  AfterContentInit,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { FuseLoadingService } from '@fuse/services/loading';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'fuse-loading-bar',
  templateUrl: './loading-bar.component.html',
  styleUrls: ['./loading-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  exportAs: 'fuseLoadingBar',
})
export class FuseLoadingBarComponent
  implements OnChanges, AfterContentInit, OnDestroy
{
  @Input() autoMode: boolean = true;
  mode: 'determinate' | 'indeterminate';
  progress: number = 0;
  show: boolean = false;
  timeout: boolean = false;

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(private _fuseLoadingService: FuseLoadingService) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnChanges(changes: SimpleChanges): void {
    // Auto mode
    if ('autoMode' in changes) {
      // Set the auto mode in the service
      this._fuseLoadingService.setAutoMode(
        coerceBooleanProperty(changes.autoMode.currentValue)
      );
    }
  }

  ngAfterContentInit(): void {
    // Subscribe to the service
    this._fuseLoadingService.mode$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((value) => {
        this.mode = value;
        this.timeout = true;
        setTimeout(this.resetTimeout.bind(this), 500);
      });

    this._fuseLoadingService.progress$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((value) => {
        this.progress = value;
      });

    this._fuseLoadingService.show$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((value) => {
        this.show = value;
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  private resetTimeout(): void {
    this.timeout = false;
  }
}
