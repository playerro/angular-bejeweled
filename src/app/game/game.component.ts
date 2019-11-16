import {Component, OnInit, ViewChild, Renderer2, ElementRef, ViewContainerRef} from '@angular/core';
import {animate, AnimationBuilder, style} from '@angular/animations';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {

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

  constructor(private renderer: Renderer2, private _builder: AnimationBuilder) { }

  ngOnInit() {
    this.initiateFieldMatrix();
    this.generateInitialGems();
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
        this.renderer.setAttribute(gem, 'class', this.gemClass);
        this.renderer.setAttribute(gem, 'id', this.gemIDPrefix + '_' + i + '_' + j);
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

    const gem1 = document.getElementById(this.gemIDPrefix + '_' + this.selectedRow + '_' + this.selectedCol) as HTMLElement;
    const gem2 = document.getElementById(this.gemIDPrefix + '_' + this.posY + '_' + this.posX) as HTMLElement;
    this.renderer.setAttribute(gem1, 'dir', '-1');
    this.renderer.setAttribute(gem2, 'dir', '1');
    [gem1, gem2].forEach(gem => {
      this.movingItems++;
      this.animateGem(gem, xOffset, yOffset);
    });
    // поменять идентификаторы гемов
    this.renderer.setAttribute(gem1, 'id', 'temp');
    this.renderer.setAttribute(gem2, 'id', this.gemIDPrefix + '_' + this.selectedRow + '_' + this.selectedCol);
    this.renderer.setAttribute(gem1, 'id', this.gemIDPrefix + '_' + this.posY + '_' + this.posX);
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
      }
    }
  }
  removeGems(row: number, col: number) {
    const gemValue = this.jewels[row][col];
    let tmp = row;
    const removingGem = document.getElementById(this.gemIDPrefix + '_' + row + '_' + col) as HTMLElement;
    this.renderer.addClass(removingGem, 'remove');
    if (this.isVerticalStreak(row, col)) {
      while (tmp > 0 && this.jewels[tmp - 1][col] === gemValue) {
        const gem = document.getElementById(this.gemIDPrefix + '_' + (tmp - 1) + '_' + col) as HTMLElement;
        this.renderer.addClass(gem, 'remove');
        this.jewels[tmp - 1][col] = -1;
        tmp--;
      }
      tmp = row;
      while (tmp < this.numRows - 1 && this.jewels[tmp + 1][col] === gemValue) {
        const gem = document.getElementById(this.gemIDPrefix + '_' + (tmp + 1) + '_' + col) as HTMLElement;
        this.renderer.addClass(gem, 'remove');
        this.jewels[tmp + 1][col] = -1;
        tmp++;
      }
    }
    if (this.isHorizontalStreak(row, col)) {
      tmp = col;
      while (tmp > 0 && this.jewels[row][tmp - 1] === gemValue) {
        const gem = document.getElementById(this.gemIDPrefix + '_' + row + '_' + (tmp - 1)) as HTMLElement;
        this.renderer.addClass(gem, 'remove');
        this.jewels[row][tmp - 1] = -1;
        tmp--;
      }
      tmp = col;
      while (tmp < this.numCols - 1 && this.jewels[row][tmp + 1] === gemValue) {
        const gem = document.getElementById(this.gemIDPrefix + '_' + row + '_' + (tmp + 1)) as HTMLElement;
        this.renderer.addClass(gem, 'remove');
        this.jewels[row][tmp + 1] = -1;
        tmp++;
      }
    }
    this.jewels[row][col] = -1;
  }
  gemFade() {
    console.log('');
  }

}
