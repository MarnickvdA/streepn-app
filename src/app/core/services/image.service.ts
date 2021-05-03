import {Injectable} from '@angular/core';
import {Camera, CameraDirection, CameraOptions, CameraResultType, CameraSource} from '@capacitor/core';
import {LoadingController} from '@ionic/angular';
import {AngularFireStorage} from '@angular/fire/storage';
import {compressAccurately, dataURLtoFile, EImageType} from 'image-conversion';
import {AngularFireFunctions} from '@angular/fire/functions';
import {trace} from '@angular/fire/performance';
import {catchError, tap} from 'rxjs/operators';
import {AnalyticsService} from '@core/services/analytics.service';
import {LoggerService} from '@core/services/logger.service';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class ImageService {
    private readonly logger = LoggerService.getLogger(ImageService.name);

    constructor(private loadingController: LoadingController,
                private storage: AngularFireStorage,
                private functions: AngularFireFunctions,
                private translate: TranslateService,
                private analyticsService: AnalyticsService) {
    }

    private cameraOptions: CameraOptions = {
        source: CameraSource.Prompt,
        promptLabelHeader: 'Kies een optie',
        promptLabelCancel: 'Annuleer',
        promptLabelPhoto: 'Neem selfie',
        promptLabelPicture: 'Kies uit foto\'s',
        resultType: CameraResultType.DataUrl,
        correctOrientation: true,
        allowEditing: true,
        direction: CameraDirection.Front,
        quality: 100,
        preserveAspectRatio: true,
        width: 256,
        height: 256,
        saveToGallery: false,
    };

    takeProfilePicture(userId: string) {
        Camera.getPhoto(this.cameraOptions)
            .then(image => {
                return this.loadingController.create({
                        message: this.translate.instant('actions.uploading'),
                        backdropDismiss: false
                    })
                    .then(loading => {
                        loading.present();
                        return this.uploadImageToStorage('thumbnails/' + userId + '.jpeg', image.dataUrl)
                            .then(downloadUrl => {
                                const callable = this.functions.httpsCallable('setProfilePhoto');
                                callable({
                                    downloadUrl
                                }).pipe(
                                    trace('setProfilePhoto'),
                                    catchError((err) => {
                                        this.logger.error({message: 'setProfilePhoto', error: err});
                                        return err;
                                    }),
                                    tap(() => {
                                        this.analyticsService.logProfilePhotoChange(userId);
                                    })
                                ).subscribe();
                            })
                            .finally(() => {
                                loading.dismiss();
                            });
                    });
            })
            .catch(err => {
                if (err.message === 'User denied access to camera' || err.message === 'Unable to access camera, user denied permission request') {
                    console.error(err);
                } else if (err.message !== 'User cancelled photos app') {
                    console.error(err);
                }
            });
    }

    uploadImageToStorage(url: string, dataUrl: string): Promise<string> {
        const ref = this.storage.ref(url);

        return this.compressImage(dataUrl)
            .then(compressedImage => {
                return ref.put(compressedImage, {
                        cacheControl: 'public,max-age=604800'
                    })
                    .then((result) => {
                        console.log(result.metadata);
                        return ref.getDownloadURL().toPromise();
                    });
            });
    }

    compressImage(dataUrl: string): Promise<Blob> {
        return dataURLtoFile(dataUrl, EImageType.JPEG).then(blob => {
            return compressAccurately(blob, {
                size: 50,
                accuracy: 0.95,
                type: EImageType.JPEG,
                width: 256,
                height: 256,
                orientation: 2,
                scale: 0.25,
            });
        });
    }
}
