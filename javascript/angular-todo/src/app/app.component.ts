/*
 * angular-todo-prototype
 *
 * app.component.ts
 *
 * Copyright (c) 2021 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Config, UserManager } from '@forgerock/javascript-sdk';
import { environment } from '../environments/environment';
import { UserService } from './services/user.service';
import { Router } from '@angular/router';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart } from '@angular/router';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'angular-todo-prototype';
  loading = false;

  constructor(public userService: UserService, private router: Router) {
    const navStart = router.events.pipe(
      filter((evt) => evt instanceof NavigationStart),
    ) as Observable<NavigationStart>;

    const navEnd = router.events.pipe(
      filter(
        (evt) =>
          evt instanceof NavigationEnd ||
          evt instanceof NavigationCancel ||
          evt instanceof NavigationError,
      ),
    );

    navStart.subscribe(() => (this.loading = true));
    navEnd.subscribe(() => (this.loading = false));
  }

  /**
   * Initialise the SDK and try to load the user when the app loads
   */
  async ngOnInit(): Promise<void> {
    /** ***************************************************************************
     * SDK INTEGRATION POINT
     * Summary: Configure the SDK
     * ----------------------------------------------------------------------------
     * Details: Below, you will see the following settings:
     * - clientId: (OAuth 2.0 only) this is the OAuth 2.0 client you created in ForgeRock, such as `ForgeRockSDKClient`
     * - redirectUri: (OAuth 2.0 only) this is the URI/URL of this app to which the
     *   OAuth 2.0 flow redirects
     * - scope: (OAuth 2.0 only) these are the OAuth scopes that you will request from
     *   ForgeRock
     * - serverConfig: this includes the baseUrl of your ForgeRock AM, and should
     *   include the deployment path at the end, such as `/am/` or `/openam/`
     * - realmPath: this is the realm to use within ForgeRock. such as `alpha` or `root`
     * - tree: The authentication journey/tree to use, such as `sdkAuthenticationTree`
     *************************************************************************** */

    const urlParams = new URLSearchParams(window.location.search);
    const centralLoginParam = urlParams.get('centralLogin');
    const journeyParam = urlParams.get('journey');
    Config.set({
      clientId: environment.WEB_OAUTH_CLIENT,
      redirectUri: `${window.location.origin}/${
        environment.CENTRALIZED_LOGIN === 'true' || centralLoginParam === 'true'
          ? 'login?centralLogin=true'
          : 'callback.html'
      }`,
      scope: 'openid profile email',
      serverConfig: {
        baseUrl: environment.SERVER_URL,
        timeout: 3000, // 9000 or less
      },
      realmPath: environment.REALM_PATH,
      tree: `${journeyParam ? journeyParam : environment.JOURNEY_LOGIN}`,
    });

    /** *****************************************************************
     * SDK INTEGRATION POINT
     * Summary: Optional client-side route access validation
     * ------------------------------------------------------------------
     * Details: Here, you could just make sure tokens exist –
     * TokenStorage.get() – or, validate tokens, renew expiry timers,
     * session checks ... Below, we are calling the userinfo endpoint to
     * ensure valid tokens before continuing, but it's optional.
     ***************************************************************** */
    try {
      // Assume user is likely authenticated if there are tokens
      const info = (await UserManager.getCurrentUser()) as Record<string, unknown>;
      this.userService.isAuthenticated = true;
      this.userService.info = info;
    } catch (err) {
      // User likely not authenticated
      console.log(err);
    }
  }
}
