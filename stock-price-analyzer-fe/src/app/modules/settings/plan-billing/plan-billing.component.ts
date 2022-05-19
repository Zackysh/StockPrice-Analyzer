import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';

@Component({
  selector: 'settings-plan-billing',
  templateUrl: './plan-billing.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPlanBillingComponent implements OnInit {
  planBillingForm: FormGroup;
  plans: any[];
  selectedPlan: 'premium' | 'basic' = 'basic';

  constructor(
    private _formBuilder: FormBuilder,
    private _authService: AuthService,
    private _userService: UserService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    // Create the form
    this.planBillingForm = this._formBuilder.group({
      cardHolder: [''],
      cardNumber: [''],
      cardExpiration: [''],
      cardCVC: [''],
      country: ['es'],
      zip: [''],
    });

    this._userService.user$.subscribe((user) => {
      this.selectedPlan = user.isPremium ? 'premium' : 'basic';
    });

    // Setup the plans
    this.plans = [
      {
        value: 'basic',
        label: 'BASIC',
        details: 'Post offers & contact with your applicants.',
        price: '0',
      },
      {
        value: 'premium',
        label: 'PREMIUM',
        details:
          'In addition, search and contact with any student registered in our platform.',
        price: '9',
      },
    ];
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  changePlan(): void {
    this._authService
      .togglePremiun(this.selectedPlan)
      .subscribe();
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}
