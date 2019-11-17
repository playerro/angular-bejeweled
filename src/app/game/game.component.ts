import {Component, OnInit, ViewChild, Renderer2, ElementRef, ViewContainerRef} from '@angular/core';
import {animate, AnimationBuilder, style} from '@angular/animations';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {
  SWIPE_ACTION = { LEFT: 'swipeleft', RIGHT: 'swiperight', UP: 'swipeup', DOWN: 'swipedown' };
  gemSize = 64;
  gemClass = 'gem';
  gemIDPrefix = 'gem';
  numRows = 7;
  numCols = 6;
  jewels = [];
  gameState = 'pick';

  bgColors = ['magenta', 'mediumblue', 'yellow', 'lime', 'cyan', 'orange', 'crimson', 'gray'];

  @ViewChild('gameField', {read: ElementRef}) gameField: ElementRef;
  @ViewChild('marker', {read: ElementRef}) marker: ElementRef;

  selectedRow = -1;
  selectedCol = -1;
  posX: number;
  posY: number;

  movingItems = 0;
  points = 0;

  constructor(private renderer: Renderer2, private _builder: AnimationBuilder) { }

  ngOnInit() {
    this.initiateFieldMatrix();
    this.generateInitialGems();
  }

  getId(row: number, col: number): string {
    return this.gemIDPrefix + '_' + row + '_' + col;
  }
  getGem(row: number, col: number): HTMLElement {
    return document.getElementById(this.getId(row, col)) as HTMLElement;
  }
  initiateFieldMatrix() {
    for (let i = 0 ; i < this.numRows; i++) {
      this.jewels[i] = [];
      for (let j = 0; j < this.numCols; j++) {
        this.jewels[i][j] = -1;
      }
    }
  }

  generateInitialGems() {
    for (let i = 0; i < this.numRows; i++) {
      for (let j = 0; j < this.numCols; j++) {
        do {
          this.jewels[i][j] = Math.floor(Math.random() * 8);
        } while (this.isStreak(i, j));
        const gem = this.renderer.createElement('div');
        this.renderer.appendChild(this.gameField.nativeElement, gem);
        this.renderer.addClass(gem, this.gemClass);
        this.renderer.setAttribute(gem, 'id', this.getId(i, j));
        this.renderer.setStyle(gem, 'top', (i * this.gemSize) + 4 + 'px');
        this.renderer.setStyle(gem, 'left', (j * this.gemSize) + 4 + 'px');
        this.renderer.setStyle(gem, 'background-color', this.bgColors[this.jewels[i][j]]);

        this.renderer.setStyle(this.marker.nativeElement, 'width', this.gemSize - 10 + 'px');
        this.renderer.setStyle(this.marker.nativeElement, 'height', this.gemSize - 10 + 'px');
        this.renderer.addClass(this.marker.nativeElement, 'marker');
      }
    }
  }

  isStreak(row: number, col: number) {
    return this.isVerticalStreak(row, col) || this.isHorizontalStreak(row, col);
  }
  isVerticalStreak(row: number, col: number) {
    const gemValue = this.jewels[row][col];
    let streak = 0;
    let tmp = row;
    while (tmp > 0 && this.jewels[tmp - 1][col] && this.jewels[tmp - 1][col] === gemValue) {
      streak++;
      tmp--;
    }
    tmp = row;
    while (tmp < this.numRows - 1 && this.jewels[tmp + 1][col] === gemValue) {
      streak++;
      tmp++;
    }

    return streak > 1;
  }

  isHorizontalStreak(row: number, col: number) {
    const gemValue = this.jewels[row][col];
    let streak = 0;
    let tmp = col;
    while (tmp > 0 && this.jewels[row][tmp - 1] === gemValue) {
      streak++;
      tmp--;
    }
    tmp = col;
    while (tmp < this.numCols && this.jewels[row][tmp + 1] === gemValue) {
      streak++;
      tmp++;
    }

    return streak > 1;
  }

  onTap(event) {
    if (event.target.classList.contains(this.gemClass) ) {
      if (this.gameState === 'pick') {
        const row =  + event.target.getAttribute('id').split('_')[1];
        const col =  + event.target.getAttribute('id').split('_')[2];

        this.renderer.setStyle(this.marker.nativeElement, 'display', 'block');
        this.renderer.setStyle(this.marker.nativeElement, 'top', row * this.gemSize + 'px');
        this.renderer.setStyle(this.marker.nativeElement, 'left', col * this.gemSize + 'px');

        if (this.selectedRow === -1) {
          this.selectedRow = row;
          this.selectedCol = col;
        } else {
          if ((Math.abs(this.selectedRow - row) === 1 && this.selectedCol === col) ||
            (Math.abs(this.selectedCol - col) === 1 && this.selectedRow === row)) {
            this.renderer.setStyle(this.marker.nativeElement, 'display', 'none');
            this.gameState = 'switch';
            this.posX = col;
            this.posY = row;
            this.gemSwitch();
          } else {
              this.selectedRow = row;
              this.selectedCol = col;
          }
        }
      }
    }
  }
  gemSwitch() {

    const yOffset = this.selectedRow - this.posY;
    const xOffset = this.selectedCol - this.posX;
    const gem1 = this.getGem(this.selectedRow, this.selectedCol);
    const gem2 = this.getGem(this.posY, this.posX);
    this.renderer.setAttribute(gem1, 'dir', '-1');
    this.renderer.setAttribute(gem2, 'dir', '1');
    [gem1, gem2].forEach(gem => {
      this.movingItems++;
      this.animateGem(gem, xOffset, yOffset);
    });
    // поменять идентификаторы гемов
    this.renderer.setAttribute(gem1, 'id', 'temp');
    this.renderer.setAttribute(gem2, 'id', this.getId(this.selectedRow, this.selectedCol));
    this.renderer.setAttribute(gem1, 'id', this.getId(this.posY, this.posX));
    // поменять элементы в сетке

    const temp = this.jewels[this.selectedRow][this.selectedCol];
    this.jewels[this.selectedRow][this.selectedCol] = this.jewels[this.posY][this.posX];
    this.jewels[this.posY][this.posX] = temp;

  }

  animateGem(gem: HTMLElement, xOffset: number, yOffset: number) {
    const left = gem.style.left.replace('px', '');
    const top = gem.style.top.replace('px', '');
    const maxLeft = (+left + xOffset * this.gemSize * (+gem.getAttribute('dir')));
    const maxTop = (+top + yOffset * this.gemSize * (+gem.getAttribute('dir')));
    const myAnimation = this._builder.build([
      style({ left: +left + 'px', top: +top + 'px' }),
      animate(250, style({ left: +maxLeft + 'px', top: +maxTop + 'px' }))
    ]);
    const player = myAnimation.create(gem);
    player.onDone(() => {
      this.renderer.setStyle(gem, 'left', maxLeft + 'px');
      this.renderer.setStyle(gem, 'top', maxTop + 'px');
      this.checkMoving();
    });
    player.play();

  }
  checkMoving() {
    this.movingItems--;
    // когда закончилась анимация последнего гема
    if (this.movingItems === 0) {
      switch (this.gameState) {
        case 'switch':
        case 'revert':
        // проверяем, появились ли группы сбора
        if (!this.isStreak(this.selectedRow, this.selectedCol) && !this.isStreak(this.posY, this.posX)) {
          // если групп сбора нет, нужно отменить совершенное движение
          // а если действие уже отменяется, то вернуться к исходному состоянию ожидания выбора
          if (this.gameState !== 'revert') {
            this.gameState = 'revert';
            this.gemSwitch();
          } else {
            this.gameState = 'pick';
            this.selectedRow = -1;
          }
        } else {
        // если группы сбора есть, нужно их удалить
          this.gameState = 'remove';
          // отметим удаляемые элементы
          if (this.isStreak(this.selectedRow, this.selectedCol)) {
              this.removeGems(this.selectedRow, this.selectedCol);
          }
          if (this.isStreak(this.posY, this.posX)) {
            this.removeGems(this.posY, this.posX);
          }
          this.gemFade();
        }
        break;

        case 'remove':
          this.checkFalling();
          break;
        // когда все гемы опущены вниз, заполняем пустоты
        case 'refill':
          this.placeNewGems();
          break;
      }
    }
  }
  removeGems(row: number, col: number) {
    const gemValue = this.jewels[row][col];
    let tmp = row;
    const removingGem = this.getGem(row, col);
    this.renderer.addClass(removingGem, 'remove');
    if (this.isVerticalStreak(row, col)) {
      while (tmp > 0 && this.jewels[tmp - 1][col] === gemValue) {
        const gem = this.getGem(tmp - 1, col);
        this.renderer.addClass(gem, 'remove');
        this.jewels[tmp - 1][col] = -1;
        tmp--;
      }
      tmp = row;
      while (tmp < this.numRows - 1 && this.jewels[tmp + 1][col] === gemValue) {
        const gem = this.getGem(tmp + 1, col);
        this.renderer.addClass(gem, 'remove');
        this.jewels[tmp + 1][col] = -1;
        tmp++;
      }
    }
    if (this.isHorizontalStreak(row, col)) {
      tmp = col;
      while (tmp > 0 && this.jewels[row][tmp - 1] === gemValue) {
        const gem = this.getGem(row, tmp - 1);
        this.renderer.addClass(gem, 'remove');
        this.jewels[row][tmp - 1] = -1;
        tmp--;
      }
      tmp = col;
      while (tmp < this.numCols - 1 && this.jewels[row][tmp + 1] === gemValue) {
        const gem = this.getGem(row, tmp + 1);
        this.renderer.addClass(gem, 'remove');
        this.jewels[row][tmp + 1] = -1;
        tmp++;
      }
    }
    this.jewels[row][col] = -1;
  }
  gemFade() {
    const gemsToRemove = document.querySelectorAll('.remove') as NodeListOf<HTMLElement>;
    this.points += gemsToRemove.length;
    gemsToRemove.forEach(gem => {
      this.movingItems++;
      const gemRemoveAnimation = this._builder.build([
        style({ opacity: 1 }),
        animate(200, style({ opacity: 0 }))
      ]);
      const player = gemRemoveAnimation.create(gem);
      player.onDone(() => {
        this.renderer.setStyle(gem, 'opacity', 0);
        gem.remove();
        this.checkMoving();
      });
      player.play();
    });
  }
  checkFalling() {
    let fellDown = 0;
    for (let j = 0; j < this.numCols; j++) {
      for (let i = this.numRows - 1; i > 0; i--) {
        if (this.jewels[i][j] === -1 && this.jewels[i - 1][j] >= 0) {
          const gem = this.getGem(i - 1, j);
          this.renderer.addClass(gem, 'fall');
          this.renderer.setAttribute(gem, 'id', this.getId(i, j));
          this.jewels[i][j] = this.jewels[i - 1][j];
          this.jewels[i - 1][j] = -1;
          fellDown++;
        }
      }
    }
    const gemsToFall = document.querySelectorAll('.fall') as NodeListOf<HTMLElement>;
    gemsToFall.forEach(gem => {
      this.movingItems++;
      const currentTop =  +gem.style.top.replace('px', '');
      const needTop = +currentTop + this.gemSize;
      const gemFallAnimation = this._builder.build([
        style({ top:  + currentTop + 'px'}),
        animate(100, style({ top: needTop + 'px' }))
      ]);
      const player = gemFallAnimation.create(gem);
      player.onDone(() => {
        this.renderer.setStyle(gem, 'top', needTop + 'px');
        this.renderer.removeClass(gem, 'fall');
        this.checkMoving();
      });
      player.play();
    });
    if (fellDown === 0) {
      this.gameState = 'refill';
      this.movingItems = 1;
      this.checkMoving();
    }
  }


  placeNewGems() {
    let gemsPlaced = 0;
    for (let i = 0; i < this.numCols; i++) {
      if (this.jewels[0][i] === -1) {
        this.jewels[0][i] = Math.floor(Math.random() * 8);
        const gem = this.renderer.createElement('div');
        this.renderer.appendChild(this.gameField.nativeElement, gem);
        this.renderer.addClass(gem, this.gemClass);
        this.renderer.setAttribute(gem, 'id', this.getId(0, i));
        this.renderer.setStyle(gem, 'top', '4px');
        this.renderer.setStyle(gem, 'left', (i * this.gemSize) + 4 + 'px');
        this.renderer.setStyle(gem, 'background-color', this.bgColors[this.jewels[0][i]]);
        gemsPlaced++;
      }
    }
    /* если появились новые гемы, проверить, нужно ли опустить что-то вниз */
    if (gemsPlaced) {
      this.gameState = 'remove';
      this.checkFalling();
    } else {
      /* если новых гемов не появилось, проверяем поле на группы сбора */
      let combo = 0;
      for (let i = 0; i < this.numRows; i++) {
        for (let j = 0; j < this.numCols; j++) {
          if ( j <= this.numCols - 3 && this.jewels[i][j] === this.jewels[i][j + 1]  && this.jewels[i][j] === this.jewels[i][j + 2]) {
            combo++;
            this.removeGems(i, j);
          }
          if (i <= this.numRows - 3 && this.jewels[i][j] === this.jewels[i + 1][j] && this.jewels[i][j] === this.jewels[i + 2][j]) {
            combo++;
            this.removeGems(i, j);
          }
        }
      }
      // удаляем найденные группы сбора
      if (combo > 0) {
        this.gameState = 'remove';
        this.gemFade();
      } else {
        this.gameState = 'pick';
        this.selectedRow = -1;
      }
    }
  }

  swipe(event , type = this.SWIPE_ACTION.RIGHT) {
    if (event.target) {
      if (this.gameState === 'pick') {
        this.selectedRow =  + event.target.getAttribute('id').split('_')[1];
        this.selectedCol =  + event.target.getAttribute('id').split('_')[2];
        // второй гем в зависимости от направления свайпа
        switch (type) {
          case this.SWIPE_ACTION.UP:
            if (this.selectedRow > 0) {
              this.renderer.setAttribute(this.marker.nativeElement, 'display', 'none');
              this.gameState = 'switch';
              this.posX = this.selectedCol;
              this.posY = this.selectedRow - 1;
              this.gemSwitch();
            }
            break;
          case this.SWIPE_ACTION.DOWN:
            if (this.selectedRow < this.numRows - 1) {
              this.renderer.setAttribute(this.marker.nativeElement, 'display', 'none');
              this.gameState = 'switch';
              this.posX = this.selectedCol;
              this.posY = this.selectedRow + 1;
              this.gemSwitch();
            }
            break;
          case this.SWIPE_ACTION.LEFT:
            if (this.selectedCol > 0) {
              this.renderer.setAttribute(this.marker.nativeElement, 'display', 'none');
              this.gameState = 'switch';
              this.posX = this.selectedCol - 1;
              this.posY = this.selectedRow;
              this.gemSwitch();
            }
            break;
          case this.SWIPE_ACTION.RIGHT:
            if (this.selectedCol < this.numRows - 1) {
              this.renderer.setAttribute(this.marker.nativeElement, 'display', 'none');
              this.gameState = 'switch';
              this.posX = this.selectedCol + 1;
              this.posY = this.selectedRow;
              this.gemSwitch();
            }
            break;
        }
      }
    }
  }

}
