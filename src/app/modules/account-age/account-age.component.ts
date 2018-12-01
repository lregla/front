import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Navigation as NavigationService } from '../../services/navigation';
import { Session } from '../../services/session';
import { MindsTitle } from '../../services/ux/title';
import { Client } from '../../services/api';
import { LoginReferrerService } from '../../services/login-referrer.service';

@Component({
  selector: 'm-age',
  templateUrl: 'account-age.component.html'
})

export class AccountAgeComponent {

  minds = window.Minds;
  hours: number;

  constructor(
    public client: Client,
    public title: MindsTitle,
  ) {
    this.title.setTitle('How Many Hours?');
  }

  ngOnInit() {
    this.loadTimeData();
  }

  private loadTimeData() {
    this.client.get('api/v2/howmanyhours')
      .then((result: {status: string, seconds: number}) => {
        let timestamp;

        if (result.status === 'success') {
            timestamp = result.seconds;
            this.hours = this.getHours(timestamp);
        }
      })
      .catch((error) => console.error(error));
  }

  private getHours(timestamp: number) {
    const difference = Date.now() - (timestamp * 1000);
    return Math.floor(difference / 3600000);
  }

}
