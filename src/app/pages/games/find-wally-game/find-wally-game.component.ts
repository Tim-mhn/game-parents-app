import { Component, OnInit, HostListener } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WaldoImage } from 'src/app/models/models';

@Component({
  selector: 'app-find-wally-game',
  templateUrl: './find-wally-game.component.html',
  styleUrls: ['./find-wally-game.component.scss']
})
export class FindWallyGameComponent implements OnInit {

  public waldoImageList: WaldoImage[] = [
    { 
      imageName: "papouille_waldo", 
      hint: { top: '60px', left: '800px', height: '500px', width: '400px' },
      hitbox: { x1: 1072, x2: 1131, y1: 154, y2: 213 }
    },
    { 
      imageName: "clara_waldo", 
      hint: { top: '60px', left: '800px', height: '500px', width: '400px' },      
      hitbox: { x1: 60, x2: 70, y1: 170, y2: 220 }
    },
    { 
      imageName: "tim_waldo", 
      hint: { top: '60px', left: '200px', height: '100px', width: '80px' },      
      hitbox: { x1: 60, x2: 70, y1: 170, y2: 220 }
    }
  ]

  public currentWaldoImage: WaldoImage; 
  constructor(private _snackbar: MatSnackBar) { }

  ngOnInit(): void {
    this.currentWaldoImage = this.waldoImageList[0]

    // setTimeout( () => this.currentWaldoImage = this.waldoImageList[1], 10000)
  }


  @HostListener('document:click',['$event', '$event.target'])
  public onClick(event: MouseEvent, targetElement: HTMLElement) {
    try {
      var img = document.getElementById(this.currentWaldoImage.imageName); 
      console.log(img)
      let x = event.pageX - img.offsetLeft
      let y = event.pageY - img.offsetTop
      console.log(event.pageX, event.pageY)
      console.log(x, y)
      if (this.clickIsInBox(x, y, this.currentWaldoImage.hitbox)) {
        console.log('found')
        this._snackbar.open('Youve found him !', 'Dismiss')
      }
    } catch (Exception) {
      console.log(Exception.message)
    }
  }

  private clickIsInBox(x: number, y: number, { x1, x2, y1, y2}): boolean {
    return x1 <= x && x <= x2 && y1 <= y && y <= y2
  }

}
