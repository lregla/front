import { Component, EventEmitter} from '@angular/core';
import { CORE_DIRECTIVES, FORM_DIRECTIVES } from '@angular/common';
import { RouterLink } from "@angular/router-deprecated";

import { Client } from '../../../services/api';
import { SessionFactory } from '../../../services/session';
import { AutoGrow } from '../../../directives/autogrow';
import { Hovercard } from '../../../directives/hovercard';
import { BUTTON_COMPONENTS } from '../../../components/buttons';
import { TagsPipe } from '../../../pipes/tags';
import { MINDS_PIPES } from '../../../pipes/pipes';

import { MDL_DIRECTIVES } from '../../../directives/material';
import { AttachmentService } from '../../../services/attachment';
import { TranslationService } from '../../../services/translation';

import { MindsVideo } from '../../../components/video';
import { MindsRichEmbed } from '../../../components/rich-embed/rich-embed';
import { Translate } from '../../../components/translate/translate';

import { ReportModal } from '../../../components/modal/modal';

@Component({
  selector: 'minds-card-comment',
  inputs: ['object', 'parent'],
  outputs: [ '_delete: delete', '_saved: saved'],
  host: {
    '(keydown.esc)': 'editing = false'
  },
  templateUrl: 'src/controllers/cards/comment/comment.html',
  directives: [ CORE_DIRECTIVES, FORM_DIRECTIVES, BUTTON_COMPONENTS, MDL_DIRECTIVES, AutoGrow, RouterLink, MindsVideo, ReportModal, MindsRichEmbed, Hovercard, Translate ],
  pipes: [ TagsPipe, MINDS_PIPES ],
  providers: [ AttachmentService ]
})

export class CommentCard {

  comment : any;
  editing : boolean = false;
  minds = window.Minds;
  session = SessionFactory.build();

  canPost: boolean = true;
  triedToPost: boolean = false;
  inProgress: boolean = false;

  _delete: EventEmitter<any> = new EventEmitter();
  _saved: EventEmitter<any> = new EventEmitter();

  reportToggle: boolean = false;

  translation = {
    translated: false,
    target: '',
    error: false,
    description: '',
    source: null
  };
  isTranslatable: boolean;
  translationInProgress: boolean;

	constructor(public client: Client, public attachment: AttachmentService, public translationService: TranslationService){
	}

  set object(value: any) {
    if(!value)
      return;
    this.comment = value;
    this.attachment.load(this.comment);

    this.isTranslatable = this.translationService.isTranslatable(this.comment);
  }

  set _editing(value : boolean){
    this.editing = value;
  }

  saveEnabled() {
    return !this.inProgress && this.canPost && (this.comment.description || this.attachment.has());
  }

  save(){
    if (!this.comment.description && !this.attachment.has()) {
      return;
    }

    let data = this.attachment.exportMeta();
    data['comment'] = this.comment.description;

    this.editing = false;
    this.inProgress = true;
    this.client.post('api/v1/comments/update/' + this.comment.guid, data)
    .then((response : any) => {
      this.inProgress = false;
      if (response.comment) {
        this._saved.next({
          comment: response.comment
        });
      }
    })
    .catch(e => {
      this.inProgress = false;
    });
  }

  applyAndSave(control: any, e) {
    e.preventDefault();

    if (this.inProgress || !this.canPost) {
      this.triedToPost = true;
      return;
    }

    this.comment.description = control.value;
    this.save();
  }

  cancel(control: any, e) {
    e.preventDefault();

    if (this.inProgress) {
      return;
    }

    this.editing = false;
    control.value = this.comment.description;
  }

  delete(){
    this.client.delete('api/v1/comments/' + this.comment.guid);
    this._delete.next(true);
  }

  uploadAttachment(file: HTMLInputElement) {
    this.canPost = false;
    this.triedToPost = false;

    this.attachment.upload(file)
    .then(guid => {
      this.canPost = true;
      this.triedToPost = false;
      file.value = null;
    })
    .catch(e => {
      console.error(e);
      this.canPost = true;
      this.triedToPost = false;
      file.value = null;
    });
  }

  removeAttachment(file: HTMLInputElement) {
    this.canPost = false;
    this.triedToPost = false;

    this.attachment.remove(file).then(() => {
      this.canPost = true;
      this.triedToPost = false;
      file.value = "";
    }).catch(e => {
      console.error(e);
      this.canPost = true;
      this.triedToPost = false;
    });
  }

  getPostPreview(message){
    if (!message.value) {
      return;
    }

    this.attachment.preview(message.value);
  }

  translate($event: any = {}) {
    if (!$event.selected) {
      return;
    }

    if (!this.translationService.isTranslatable(this.comment)) {
      return;
    }

    this.translation.target = '';
    this.translationService.getLanguageName($event.selected)
      .then(name => this.translation.target = name);

    this.translationInProgress = true;

    this.translationService.translate(this.comment.guid, $event.selected)
      .then((translation: any) => {
        this.translationInProgress = false;
        this.translation.source = null;

        for (let field in translation) {
          this.translation.translated = true;
          this.translation[field] = translation[field].content;

          if (this.translation.source === null && translation[field].source) {
            this.translation.source = '';
            this.translationService.getLanguageName(translation[field].source)
              .then(name => this.translation.source = name);
          }
        }
      })
      .catch(e => {
        this.translationInProgress = false;
        this.translation.error = true;

        console.error('translate()', e);
      });
  }

  hideTranslation() {
    if (!this.translation.translated) {
      return;
    }

    this.translation.translated = false;
  }
}
