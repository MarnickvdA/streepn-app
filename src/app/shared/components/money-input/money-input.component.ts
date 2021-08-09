import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {IonInput} from '@ionic/angular';
import {getMoneyString} from '@core/utils/formatting-utils';

@Component({
    selector: 'app-money-input',
    templateUrl: './money-input.component.html',
    styleUrls: ['./money-input.component.scss'],
})
export class MoneyInputComponent implements OnInit {

    @Input() precision: number;
    @Input() amount: string;
    @Input() icon = 'pricetag-outline';
    @Input() padding: 'none' | undefined = undefined;
    @Input() tabIndex = -1;
    @Input() enabled = true;
    @Output() amountEntered = new EventEmitter<number>();
    @ViewChild('dummyFacade', {static: false}) private dummyFacade: IonInput;

    amountString: string;

    constructor() {
    }

    get formattedAmount(): string {
        return getMoneyString(+this.amount);
    }

    ngOnInit() {
        this.amount = '0';
        this.amountString = this.formattedAmount;
        if (this.amount && this.amount.trim() !== '') {
            this.amountEntered.emit(+this.amount);
        }
    }

    handleKeyUp(event: KeyboardEvent) {
        // this handles keyboard input for backspace
        if (event.key === 'Backspace') {
            this.delDigit();
        }
    }

    handleInput(event: any) {
        this.clearInput();
        // check if digit
        if (event.detail.data && !isNaN(event.detail.data)) {
            this.addDigit(event.detail.data);
        } else if (event.detail.inputType === 'deleteContentBackward') {
            // this handles numpad input for delete/backspace
            this.delDigit();
        }
    }

    openInput() {
        this.dummyFacade.setFocus();
    }

    setAmount(amount: number) {
        this.amount = '0';
        this.amountString = this.formattedAmount;
        setTimeout(() => {
            this.handleInput(new CustomEvent('', {
                detail: {
                    data: amount
                }
            }));
        });
    }

    private addDigit(key: string) {
        this.amount = this.amount + key;
        this.amountEntered.emit(+this.amount);

        this.amountString = this.formattedAmount;
    }

    private delDigit() {
        this.amount = this.amount.substring(0, this.amount.length - 1);
        this.amountEntered.emit(+this.amount);

        this.amountString = this.formattedAmount;
    }

    private clearInput() {
        this.dummyFacade.value = ''; // ensures work for mobile devices
        // ensures work for browser
        this.dummyFacade.getInputElement().then((native: HTMLInputElement) => {
            native.value = '';
        });
    }
}
