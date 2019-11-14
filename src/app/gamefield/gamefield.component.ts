import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-gamefield',
  templateUrl: './gamefield.component.html',
  styleUrls: ['./gamefield.component.css']
})
export class GamefieldComponent implements OnInit {
  @Input() numCols: number;
  @Input() numRows: number;
  @Input() gemSize: number;
  constructor() { }

  ngOnInit() {
  }

}
