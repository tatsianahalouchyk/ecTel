import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Colors, SortByParams } from 'src/app/enums';
import { IConfig, IData, IOptionGroup } from 'src/app/interfaces';

@Component({
  selector: 'app-wrapper',
  templateUrl: './wrapper.component.html',
  styleUrls: ['./wrapper.component.scss']
})
export class WrapperComponent implements OnInit, OnDestroy {
  reactForm: FormGroup;

  config: IConfig;
  data: IData[] = [
    { name: 'Cherry', color: Colors.RED },
    { name: 'Lemon', color: Colors.YELLOW },
    { name: 'Apple', color: Colors.RED },
    { name: 'Grape', color: Colors.GREEN },
    { name: 'Watermelon', color: Colors.RED },
    { name: 'Kiwi', color: Colors.GREEN },
    { name: 'Pineapple', color: Colors.YELLOW },
    { name: 'Pear', color: Colors.GREEN },
  ];
  filterBy: Colors = Colors.NO_COLOR;
  sortBy: SortByParams = SortByParams.NO_PARAMS;
  isOptGroups: boolean = false;

  selectOptions: IData[] | IOptionGroup[] = [];

  choosedOptions: string[] = [];

  private destroy$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.addNewForm();

    // set initial options' value:
    this.setInitOptions();

    // set initial config's value:
    this.config = this.reactForm.get('configForm').value;

    // set initial isOptGroups's value:
    this.isOptGroups = this.reactForm.get('isColorGroups').value;

    this.reactForm.get('configForm').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(v => {
      this.config = v;
    });

    this.reactForm.get('filterForm').get('red').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(v => {
      if (v) {
        this.reactForm.get('filterForm').get('yellow').setValue(false);
        this.reactForm.get('filterForm').get('green').setValue(false);

        this.filterBy = Colors.RED;
      } else {
        this.filterBy =
          this.reactForm.get('filterForm').get('yellow').value ?
          Colors.YELLOW : this.reactForm.get('filterForm').get('green').value ?
          Colors.GREEN : Colors.NO_COLOR;
      }
      this.dataFilter(this.filterBy);
    });

    this.reactForm.get('filterForm').get('yellow').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(v => {
      if (v) {
        this.reactForm.get('filterForm').get('red').setValue(false);
        this.reactForm.get('filterForm').get('green').setValue(false);

        this.filterBy = Colors.YELLOW;
      } else {
        this.filterBy =
          this.reactForm.get('filterForm').get('red').value ?
          Colors.RED : this.reactForm.get('filterForm').get('green').value ?
          Colors.GREEN : Colors.NO_COLOR;
      }
      this.dataFilter(this.filterBy);
    });

    this.reactForm.get('filterForm').get('green').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(v => {
      if (v) {
        this.reactForm.get('filterForm').get('red').setValue(false);
        this.reactForm.get('filterForm').get('yellow').setValue(false);

        this.filterBy = Colors.GREEN;
      } else {
        this.filterBy =
          this.reactForm.get('filterForm').get('red').value ?
          Colors.RED : this.reactForm.get('filterForm').get('yellow').value ?
          Colors.YELLOW : Colors.NO_COLOR;
      }
      this.dataFilter(this.filterBy);
    });

    this.reactForm.get('sortForm').get('az').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(v => {
      if (v) {
        this.reactForm.get('sortForm').get('za').setValue(false);
        this.sortBy = SortByParams.AZ;
      } else {
        this.sortBy = this.reactForm.get('sortForm').get('za').value ? SortByParams.ZA : SortByParams.NO_PARAMS;
      }
      this.dataSort(this.sortBy);
    });
    this.reactForm.get('sortForm').get('za').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(v => {
        this.setInitOptions();
        if (v) {
        this.reactForm.get('sortForm').get('az').setValue(false);
        this.sortBy = SortByParams.ZA;
      } else {
        this.sortBy = this.reactForm.get('sortForm').get('az').value ? SortByParams.AZ : SortByParams.NO_PARAMS;
      }
        this.dataSort(this.sortBy);
    });

    this.reactForm.get('isColorGroups').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(v => {
      this.isOptGroups = v;
      if (v) {
        this.groupOnColor();
      } else {
        this.setInitOptions();
      }
    });
  }

  onSaveChanges(ev: string[] | string) {
      if (ev) {
      if (Array.isArray(ev)) {
        this.choosedOptions = ev;
      } else {
        this.choosedOptions.push(ev);
      }
    }
  }

  public ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  private setInitOptions() {
    this.selectOptions = this.data.map(el => el);
  }

  private addNewForm() {
    this.reactForm = this.fb.group({
      configForm: this.fb.group({
        label: new FormControl('Fruit list'),
        multiple: new FormControl(true),
        disabled: new FormControl(false),
      }),
      filterForm: this.fb.group({
        red: new FormControl(false),
        yellow: new FormControl(false),
        green: new FormControl(false),
      }),
      sortForm: this.fb.group({
        az: new FormControl(false),
        za: new FormControl(false),
      }),
      isColorGroups: new FormControl(false),
    });
  }

  private dataSort(sortParam: string) {
      if (sortParam === SortByParams.AZ) {
        this.selectOptions =  this.selectOptions.sort((a, b) => a.name !== b.name ? a.name < b.name ? -1 : 1 : 0);
      } else if (sortParam === SortByParams.ZA) {
        this.selectOptions =  this.selectOptions.sort((a, b) => a.name !== b.name ? a.name > b.name ? -1 : 1 : 0);
      } else if (sortParam === SortByParams.NO_PARAMS) {
        this.setInitOptions();
      }
      this.resetFilterForm();
      this.resetGroupControl();
  }

  private dataFilter(filterByColor: Colors) {
    if (filterByColor === Colors.NO_COLOR) {
      this.setInitOptions();
    } else {
      this.selectOptions =
        filterByColor === Colors.RED ? this.setOptionsByColor(this.data, Colors.RED) :
        filterByColor === Colors.YELLOW ? this.setOptionsByColor(this.data, Colors.YELLOW) :
        this.setOptionsByColor(this.data, Colors.GREEN);
    }
    this.resetSortForm();
    this.resetGroupControl();
  }

  private groupOnColor() {
    const yellowArr: IData[] = this.setOptionsByColor((this.selectOptions as Array<IData>), Colors.YELLOW);
    const redArr: IData[] = this.setOptionsByColor((this.selectOptions as Array<IData>), Colors.RED);
    const greenArr: IData[] = this.setOptionsByColor((this.selectOptions as Array<IData>), Colors.GREEN);

    this.selectOptions = [
      {
        groupName: Colors.YELLOW,
        options: yellowArr
      },
      {
        groupName: Colors.RED,
        options: redArr
      },
      {
        groupName: Colors.GREEN,
        options: greenArr
      }
    ];

    this.resetFilterForm();
    this.resetSortForm();
  }

    private setOptionsByColor(options: IData[], color: Colors) {
    return options.filter(el => el.color === color);
  }

  private resetFilterForm() {
    this.reactForm.get('filterForm').setValue({
      red: false,
      yellow: false,
      green: false,
    }, {emitEvent: false});
  }

  private resetSortForm() {
    this.reactForm.get('sortForm').setValue({
      az: false,
      za: false,
    }, { emitEvent: false });
  }

  private resetGroupControl() {
    this.isOptGroups = false;
    this.reactForm.get('isColorGroups').setValue(false, {emitEvent: false});
  }
}
