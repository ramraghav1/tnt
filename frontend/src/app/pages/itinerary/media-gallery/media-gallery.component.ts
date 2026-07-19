import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { Image } from 'primeng/image';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ItineraryEnhancementService, ItineraryMedia, CreateMediaRequest } from '../itinerary-enhancement.service';
// import { SafePipe } from '../../../shared/pipes/safe.pipe';

@Component({
    selector: 'app-media-gallery',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        Image,
        DialogModule,
        InputTextModule,
        TextareaModule,
        Select,
        CheckboxModule,
        ConfirmDialog,
        ToastModule,
        TooltipModule,
        TranslateModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './media-gallery.component.html',
    styleUrls: ['./media-gallery.component.scss']
})
export class MediaGalleryComponent implements OnInit, OnChanges {
    @Input() itineraryId!: number;
    @Input() editable: boolean = true;

    mediaItems: ItineraryMedia[] = [];
    loading = false;
    showAddDialog = false;
    showVideoDialog = false;
    selectedMedia: ItineraryMedia | null = null;

    newMedia: CreateMediaRequest = {
        mediaType: 'Image',
        mediaUrl: '',
        caption: '',
        displayOrder: 0,
        isFeatured: false
    };

    mediaTypes = [
        { label: 'Image', value: 'Image' },
        { label: 'Video', value: 'Video' },
        { label: 'Video Link (YouTube)', value: 'VideoLink' }
    ];

    responsiveOptions = [
        {
            breakpoint: '1024px',
            numVisible: 5
        },
        {
            breakpoint: '768px',
            numVisible: 3
        },
        {
            breakpoint: '560px',
            numVisible: 1
        }
    ];

    constructor(
        private enhancementService: ItineraryEnhancementService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private translate: TranslateService,
        private cd: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        console.log('MediaGalleryComponent ngOnInit - itineraryId:', this.itineraryId);
        // Don't load here - let ngOnChanges handle it
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log('MediaGalleryComponent ngOnChanges:', changes);
        // Load media whenever itineraryId is set or changes
        if (changes['itineraryId']?.currentValue) {
            console.log('Loading media for itineraryId:', changes['itineraryId'].currentValue);
            this.loadMedia();
        }
    }

    loadMedia() {
        if (!this.itineraryId) {
            console.log('No itineraryId, skipping media load');
            return;
        }
        
        console.log('loadMedia called for itinerary:', this.itineraryId);
        this.loading = true;
        this.enhancementService.getMedia(this.itineraryId).subscribe({
            next: (media) => {
                console.log('Media loaded successfully:', media);
                this.mediaItems = media.sort((a, b) => a.displayOrder - b.displayOrder);
                console.log('Sorted media items:', this.mediaItems);
                this.loading = false;
                this.cd.detectChanges();
                console.log('Change detection triggered');
            },
            error: (err) => {
                console.error('Error loading media:', err);
                this.loading = false;
                this.cd.detectChanges();
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('common.error'),
                    detail: 'Failed to load media'
                });
            }
        });
    }

    openAddDialog() {
        this.newMedia = {
            mediaType: 'Image',
            mediaUrl: '',
            caption: '',
            displayOrder: this.mediaItems.length,
            isFeatured: false
        };
        this.showAddDialog = true;
    }

    closeAddDialog() {
        this.showAddDialog = false;
        this.newMedia = {
            mediaType: 'Image',
            mediaUrl: '',
            caption: '',
            displayOrder: 0,
            isFeatured: false
        };
    }

    addMedia() {
        if (!this.newMedia.mediaUrl) {
            this.messageService.add({
                severity: 'warn',
                summary: this.translate.instant('common.validation'),
                detail: 'Media URL is required'
            });
            return;
        }

        this.loading = true;
        this.enhancementService.addMedia(this.itineraryId, this.newMedia).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: this.translate.instant('common.success'),
                    detail: 'Media added successfully'
                });
                this.closeAddDialog();
                this.loadMedia();
            },
            error: (err) => {
                console.error(err);
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('common.error'),
                    detail: 'Failed to add media'
                });
            }
        });
    }

    deleteMedia(mediaId: number) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this media?',
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.enhancementService.deleteMedia(mediaId).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('common.success'),
                            detail: 'Media deleted successfully'
                        });
                        this.loadMedia();
                    },
                    error: (err) => {
                        console.error(err);
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('common.error'),
                            detail: 'Failed to delete media'
                        });
                    }
                });
            }
        });
    }

    setFeatured(mediaId: number) {
        this.enhancementService.setFeaturedMedia(mediaId).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: this.translate.instant('common.success'),
                    detail: 'Featured media updated'
                });
                this.loadMedia();
            },
            error: (err) => {
                console.error(err);
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('common.error'),
                    detail: 'Failed to update featured media'
                });
            }
        });
    }

    openVideoDialog(media: ItineraryMedia) {
        this.selectedMedia = media;
        this.showVideoDialog = true;
    }

    getYouTubeThumbnail(url: string): string {
        const videoId = this.extractYouTubeId(url);
        return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
    }

    getMediaThumbnail(media: ItineraryMedia): string {
        if (media.mediaType === 'VideoLink') {
            // Extract YouTube video ID and get thumbnail
            const videoId = this.extractYouTubeId(media.mediaUrl);
            return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : media.mediaUrl;
        }
        return media.mediaUrl;
    }

    extractYouTubeId(url: string): string | null {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    getVideoEmbedUrl(url: string): string {
        const videoId = this.extractYouTubeId(url);
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
}
