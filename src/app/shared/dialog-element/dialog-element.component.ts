import { Component, OnInit, Input, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-element',
  templateUrl: './dialog-element.component.html',
  styleUrls: ['./dialog-element.component.scss']
})
export class DialogElementComponent implements OnInit {


  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
  }

}
