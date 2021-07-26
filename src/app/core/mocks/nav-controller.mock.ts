import {AnimationBuilder, IonRouterOutlet, NavController} from '@ionic/angular';
import {UrlTree} from '@angular/router';
import {AnimationOptions, NavigationOptions} from '@ionic/angular/providers/nav-controller';

class NavControllerMockImpl // extends NavController (Uncomment to test if implementation still conforms)
{
	navigateForward(url: string | UrlTree | any[], options?: NavigationOptions): Promise<boolean> {
		return Promise.resolve(true);
	}

	navigateBack(url: string | UrlTree | any[], options?: NavigationOptions): Promise<boolean> {
		return Promise.resolve(true);
	}

	navigateRoot(url: string | UrlTree | any[], options?: NavigationOptions): Promise<boolean> {
		return Promise.resolve(true);
	}

	back(options?: AnimationOptions) {
	}

	pop(): Promise<void> {
		return Promise.resolve();
	}

	setDirection(direction: RouterDirection, animated?: boolean, animationDirection?: NavDirection, animationBuilder?: AnimationBuilder) {
	}

	setTopOutlet(outlet: IonRouterOutlet) {
	}

	consumeTransition(): { direction: RouterDirection; animation: NavDirection; animationBuilder: AnimationBuilder } {
		return undefined;
	}
}

export const navControllerMock = {
	provide: NavController,
	useClass: NavControllerMockImpl
};

declare type RouterDirection = 'forward' | 'back' | 'root';
declare type NavDirection = 'back' | 'forward';

