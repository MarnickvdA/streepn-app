import {Timestamp} from '@firebase/firestore-types';

export interface PersonalData {
    firstName?: string;
    lastName?: string;
    gender?: string;
    birthDate?: Timestamp;
    email?: string;
    address?: {
        street: string;
        streetNumber: string;
        postalCode: string;
        city: string;
        country: string;
    };
}

export class AppUser {
    readonly authId: string;
    acceptedLegalVersion: string;
    pushToken?: string;
    personalData?: PersonalData;

    constructor(authId: string, acceptedLegalVersion: string, pushToken: string, personalData: PersonalData) {
        this.authId = authId;
        this.acceptedLegalVersion = acceptedLegalVersion;
        this.pushToken = pushToken;
        this.personalData = personalData;
    }
}

export const userConverter = {
    toFirestore(user: AppUser) {
        return user;
    },
    newProduct(data: { [key: string]: any }): AppUser {
        return new AppUser(data.id, data.acceptedLegalVersion, data.pushToken, data.personalData);
    }
};
