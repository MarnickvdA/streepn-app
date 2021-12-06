import {Injectable} from '@angular/core';
import {LoadingController} from '@ionic/angular';
import {compressAccurately, dataURLtoFile, EImageType} from 'image-conversion';
import {catchError, tap} from 'rxjs/operators';
import {AnalyticsService} from '@core/services/firebase/analytics.service';
import {LoggerService} from '@core/services/logger.service';
import {TranslateService} from '@ngx-translate/core';
import {Camera, CameraDirection, CameraResultType, CameraSource, ImageOptions} from '@capacitor/camera';
import {AlertService, AppErrorMessage} from '@core/services/alert.service';
import {Functions, httpsCallable} from '@angular/fire/functions';
import {getDownloadURL, ref, Storage, uploadBytes} from '@angular/fire/storage';
import {Performance, trace} from '@angular/fire/performance';

@Injectable({
    providedIn: 'root'
})
export class ImageService {
    private readonly logger = LoggerService.getLogger(ImageService.name);
    private imageOptions: ImageOptions = {
        source: CameraSource.Prompt,
        promptLabelHeader: this.translate.instant('camera.promptHeader'),
        promptLabelCancel: this.translate.instant('actions.cancel'),
        promptLabelPhoto: this.translate.instant('camera.promptPhoto'),
        promptLabelPicture: this.translate.instant('camera.promptPicture'),
        resultType: CameraResultType.DataUrl,
        correctOrientation: true,
        allowEditing: true,
        direction: CameraDirection.Front,
        presentationStyle: 'popover',
        quality: 100,
        preserveAspectRatio: true,
        width: 256,
        height: 256,
        saveToGallery: false,
    };

    constructor(private loadingController: LoadingController,
                private storage: Storage,
                private functions: Functions,
                private performance: Performance,
                private translate: TranslateService,
                private alertService: AlertService,
                private analyticsService: AnalyticsService) {
    }

    takeProfilePicture(userId: string) {
        Camera.getPhoto(this.imageOptions)
            .then(image => this.loadingController.create({
                    message: this.translate.instant('actions.uploading'),
                    backdropDismiss: false
                })
                .then(loading => {
                    loading.present();
                    return this.uploadImageToStorage('thumbnails/' + userId + '.jpeg', image.dataUrl)
                        .then(downloadUrl => {
                            httpsCallable(this.functions, 'setProfilePhoto').call({
                                downloadUrl
                            }).pipe(
                                trace(this.performance, 'setProfilePhoto'),
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
                }))
            .catch(err => {
                if (err.message === 'User denied access to camera'
                    || err.message === 'Unable to access camera, user denied permission request') {
                    this.alertService.promptAppError(AppErrorMessage.cameraAccessDenied);
                } else {
                    console.error(err);
                }
            });
    }

    uploadImageToStorage(url: string, dataUrl: string): Promise<string> {
        const imageRef = ref(this.storage, url);

        return this.compressImage(dataUrl)
            .then(compressedImage => uploadBytes(imageRef, compressedImage, {
                    cacheControl: 'public,max-age=604800'
                }
            ).then((result) => getDownloadURL(result.ref)));
    }

    compressImage(dataUrl: string): Promise<Blob> {
        return dataURLtoFile(dataUrl, EImageType.JPEG).then(blob => compressAccurately(blob, {
            size: 50,
            accuracy: 0.95,
            type: EImageType.JPEG,
            width: 256,
            height: 256,
            orientation: 2,
            scale: 0.25,
        }));
    }
}
