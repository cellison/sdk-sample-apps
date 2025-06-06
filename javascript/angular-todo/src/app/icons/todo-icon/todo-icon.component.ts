/*
 * angular-todo-prototype
 *
 * todo-icon.component.ts
 *
 * Copyright (c) 2021 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-todo-icon',
  templateUrl: './todo-icon.component.html',
})
export class TodoIconComponent {
  @Input() size = '24px';
  @Input() completed?: boolean = false;
}
