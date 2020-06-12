import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WaldoImage } from 'src/app/models/models';
import { CountdownComponent } from 'ngx-countdown';
import { Subscription, zip, of, timer, from } from 'rxjs';


@Component({
  selector: 'app-find-wally-game',
  templateUrl: './find-wally-game.component.html',
  styleUrls: ['./find-wally-game.component.scss']
})
export class FindWallyGameComponent implements OnInit {
  @ViewChild('cd', { static: false }) private countdown: CountdownComponent;

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
  public gameStarted = false;
  public timeToFind = 30000; // ms
  public timeToStart = 5000;
  constructor(private _snackbar: MatSnackBar) { }

  ngOnInit(): void {
    // this.currentWaldoImage = this.waldoImageList[0]

  }

  private _nextImage() {
    let nextIdx = this.waldoImageList.indexOf(this.currentWaldoImage) + 1;
    this.currentWaldoImage = this.waldoImageList[nextIdx];
  }

  public startGame() {
    this.gameStarted = true
    this.countdown.begin()
    this.countdown.config.leftTime = this.timeToFind / 1000
    this.countdown.config.demand = false;
    const timerQuestionsObs = zip(
      from(this.waldoImageList),
      timer(this.timeToStart, this.timeToFind)
    )

    timerQuestionsObs.subscribe(([waldoImg, i]) => {
      // Restart countdown at each question (except final one)
      this.currentWaldoImage = waldoImg;
      this.countdown.restart();
    })
  }


  @HostListener('document:click', ['$event', '$event.target'])
  public onClick(event: MouseEvent, targetElement: HTMLElement) {
    try {
      var img = document.getElementById(this.currentWaldoImage.imageName);
      let x = event.pageX - img.offsetLeft
      let y = event.pageY - img.offsetTop
      console.log(event.pageX, event.pageY)
      console.log(x, y)
      if (this.clickIsInBox(x, y, this.currentWaldoImage.hitbox)) {
        console.log('found')
        this._snackbar.open('Youve found him !', 'Dismiss')
        setTimeout(() => this._nextImage(), 3000);
      }
    } catch (Exception) {
      console.log(Exception.message)
    }
  }

  private clickIsInBox(x: number, y: number, { x1, x2, y1, y2 }): boolean {
    return x1 <= x && x <= x2 && y1 <= y && y <= y2
  }

}
