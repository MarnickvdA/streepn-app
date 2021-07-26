import {IonRouterOutlet} from '@ionic/angular';

class IonRouterOutletMockImpl extends IonRouterOutlet {
    nativeEl = new HTMLIonRouterOutletElement();
}

export const ionRouterOutletMock = {
    provide: IonRouterOutlet,
    useClass: IonRouterOutletMockImpl
};
