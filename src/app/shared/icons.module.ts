import {NgModule} from '@angular/core';
import {FaIconLibrary, FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import * as DuoIcons from '@fortawesome/pro-duotone-svg-icons';
import * as RegularIcons from '@fortawesome/pro-regular-svg-icons';
import * as LightIcons from '@fortawesome/pro-light-svg-icons';
import * as SolidIcons from '@fortawesome/pro-solid-svg-icons';

@NgModule({
    imports: [ FontAwesomeModule ],
    exports: [ FontAwesomeModule ]
})
export class IconsModule {
    constructor(library: FaIconLibrary) {
        library.addIcons(
            DuoIcons.faBars,
            DuoIcons.faChevronLeft,
            DuoIcons.faTimes,
            DuoIcons.faTimesCircle,
            RegularIcons.faPlus,
            DuoIcons.faMinusCircle,
            DuoIcons.faInfoCircle,
            DuoIcons.faUser,
            DuoIcons.faBell,
            DuoIcons.faUsersCrown,
            DuoIcons.faWallet,
            DuoIcons.faPlusCircle,
            DuoIcons.faMinusCircle,
            DuoIcons.faSignOut,
            DuoIcons.faCalculatorAlt,
            DuoIcons.faClock,
            DuoIcons.faTicket,
            DuoIcons.faHouse,
            DuoIcons.faReceipt,
            DuoIcons.faInventory,
            DuoIcons.faCogs,
            RegularIcons.faShoppingCart,
            DuoIcons.faShareAltSquare,
            DuoIcons.faCheckCircle,
            DuoIcons.faEdit,
            DuoIcons.faHistory,
            DuoIcons.faTag,
            DuoIcons.faTrashAlt,
            DuoIcons.faBoxFull,
            DuoIcons.faUser,
            DuoIcons.faAt,
            DuoIcons.faList,
            DuoIcons.faUserCog,
            DuoIcons.faAdjust,
            LightIcons.faStar,
            SolidIcons.faStar,
            DuoIcons.faDollyFlatbedAlt,
            DuoIcons.faPlus,
            DuoIcons.faGifts,
            DuoIcons.faSack,
            DuoIcons.faArrowAltCircleDown,
            DuoIcons.faHeadset,
            DuoIcons.faExternalLink
        );
    }
}
