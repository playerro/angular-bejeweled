import {Component, OnInit, ViewChild, Renderer2, ElementRef, ViewContainerRef} from '@angular/core';
import {GamefieldComponent} from '../gamefield/gamefield.component';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
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

  constructor(private renderer: Renderer2) { }

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
        this.renderer.setStyle(this.marker.nativeElement, 'border', '5px solid white');
        this.renderer.setStyle(this.marker.nativeElement, 'position', 'absolute');
        this.renderer.setStyle(this.marker.nativeElement, 'display', 'none');
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
          }
        }
      }
    }
  }
}
