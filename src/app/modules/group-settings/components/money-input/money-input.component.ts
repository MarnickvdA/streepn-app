import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {IonInput} from '@ionic/angular';
import {getMoneyString} from '../../../../core/utils/firestore-utils';

@Component({
    selector: 'app-money-input',
    templateUrl: './money-input.component.html',
    styleUrls: ['./money-input.component.scss'],
})
export class MoneyInputComponent implements OnInit {

    private static BACKSPACE_KEY = 'Backspace';
    private static BACKSPACE_INPUT_TYPE = 'deleteContentBackward';

    @ViewChild('dummyFacade', {static: false}) private dummyFacade: IonInput;

    @Input() precision: number;

    @Input() amount: string;

    @Output() amountEntered = new EventEmitter<number>();

    amountString: string;

    constructor() {
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
        if (event.key === MoneyInputComponent.BACKSPACE_KEY) {
            this.delDigit();
        }
    }

    handleInput(event: CustomEvent) {
        this.clearInput();
        // check if digit
        if (event.detail.data && !isNaN(event.detail.data)) {
            this.addDigit(event.detail.data);
        } else if (event.detail.inputType === MoneyInputComponent.BACKSPACE_INPUT_TYPE) {
            // this handles numpad input for delete/backspace
            this.delDigit();
        }
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

    get formattedAmount(): string {
        return getMoneyString(+this.amount);
    }

    openInput() {
        this.dummyFacade.setFocus();
    }
}
