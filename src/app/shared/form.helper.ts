import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class FormHelper {
  convertIntObj = (obj: any): any => {
    const res = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const parsed = parseInt(obj[key], 10);
        res[key] = isNaN(parsed) ? obj[key] : parsed;
      }
    }

    return res;
  };

  deleteNullValues = (object: any): any => {
    Object.keys(object).forEach(
      (key) => object[key] === null && delete object[key]
    );
    return object;
  };

  formatDate(date: any): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }

    return [year, month, day].join('-');
  }

  getFormValidationErrors(
    form: FormGroup
  ): { control: string; error: ValidationErrors; value: string }[] {
    const result = [];
    Object.keys(form.controls).forEach((key) => {
      const controlErrors: ValidationErrors = form.get(key).errors;
      if (controlErrors) {
        Object.keys(controlErrors).forEach((keyError) => {
          result.push({
            control: key,
            error: keyError,
            value: controlErrors[keyError],
          });
        });
      }
    });

    return result;
  }
}
