import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IConfig, IData, IOptionGroup } from 'src/app/interfaces';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent implements OnInit, OnChanges {
  fc: FormControl = new FormControl('', Validators.required);
  isFormValid: boolean = true;

  isMultiple: boolean;

  private destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  @Input() config: IConfig;
  @Input() data: IData | IOptionGroup;
  @Input() isOptGroups: boolean;

  @Output() saveChanges: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() { }


  ngOnInit(): void {
    this.isMultiple = this.config.multiple;
    this.fc.valueChanges.pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnChanges() {
    if (this.isMultiple !== this.config.multiple) {
      this.fc.setValue('');
      this.isMultiple = this.config.multiple;
    }
  }

  onSave() {
    if (this.fc.status === 'VALID') {
      this.isFormValid = true;
      this.saveChanges.emit(true);
    } else {
      this.isFormValid = false;
    }
  }

}
