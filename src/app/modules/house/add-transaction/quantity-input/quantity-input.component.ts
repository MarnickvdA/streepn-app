import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-quantity-input',
    templateUrl: './quantity-input.component.html',
    styleUrls: ['./quantity-input.component.scss'],
})
export class QuantityInputComponent implements OnInit, OnDestroy {

    @Input() minValue = 0;
    @Input() actions: {
        set: Subject<number>;
        add: Subject<number>;
        reset: Subject<void>;
    };

    @Input() set initialValue(amount: number) {
        this.onInputChanged(amount);
    };

    @ViewChild('input') inputField;

    @Output() valueChange = new EventEmitter<number>();

    currentValue = 0;

    private ignoreChange = false;
    private onDestroyNotifier = new Subject();

    constructor() {
    }

    ngOnInit() {
        this.actions.set
            .pipe(takeUntil(this.onDestroyNotifier))
            .subscribe(value => {
                this.currentValue = value;
            });

        this.actions.add
            .pipe(takeUntil(this.onDestroyNotifier))
            .subscribe(value => {
                this.ignoreChange = false;
                this.increment(value);
            });

        this.actions.reset
            .pipe(takeUntil(this.onDestroyNotifier))
            .subscribe(_ => {
                this.ignoreChange = false;
                this.decrement(this.currentValue);
            });
    }

    ngOnDestroy() {
        this.onDestroyNotifier.next();
        this.onDestroyNotifier.complete();
    }

    decrement(by: number) {
        if (this.currentValue - by >= this.minValue) {
            this.currentValue -= by;
        }
    }

    increment(by: number) {
        this.currentValue += by;
    }

    onInputChanged($event) {
        if (!$event.detail?.value) {
            this.currentValue = undefined;
        } else {
            this.currentValue = +$event.detail?.value;
            this.valueChange.emit(this.currentValue);
        }
    }

    onFocusOut($event: FocusEvent) {
        if (!this.currentValue) {
            this.currentValue = 0;
        }
    }
}
