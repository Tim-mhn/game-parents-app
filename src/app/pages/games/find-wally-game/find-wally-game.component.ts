import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IWaldoImage } from 'src/app/models/models';
import { CountdownComponent, CountdownEvent } from 'ngx-countdown';
import { Subscription, zip, of, timer, from, merge, BehaviorSubject, ReplaySubject } from 'rxjs';
import { EventEmitter } from 'events';
import { ThrowStmt } from '@angular/compiler';
import { MatDialog } from '@angular/material/dialog';
import { DialogElementComponent } from 'src/app/shared/dialog-element/dialog-element.component';


@Component({
  selector: 'app-find-wally-game',
  templateUrl: './find-wally-game.component.html',
  styleUrls: ['./find-wally-game.component.scss']
})
export class FindWallyGameComponent implements OnInit {
  @ViewChild('cd', { static: false }) public countdown: CountdownComponent;

  public waldoImageList: IWaldoImage[] = [
    {
      imageName: "papouille_waldo",
      character: "Papouille",
      hintBox: { x1: 850, x2: 1220, y1: 50, y2: 300 },
      hitbox: { x1: 1072, x2: 1131, y1: 154, y2: 213 }
    },
    {
      imageName: "clara_waldo",
      character: "Clara",
      hintBox: { x1: 240, x2: 550, y1: 0, y2: 300 },
      hitbox: { x1: 417, x2: 434, y1: 121, y2: 149}
    },
    {
      imageName: "tim_waldo",
      character: "Tim",
      hintBox: { x1: 720, x2: 850, y1: 180, y2: 350 },
      hitbox: { x1: 764, x2: 791, y1: 243, y2: 281 }
    },
    {
      imageName: "dad_waldo",
      character: "Dad",
      hintBox: { x1: 80, x2: 480, y1: 120, y2: 495 },
      hitbox: { x1: 185, x2: 217, y1: 285, y2: 325 }
    },
    {
      imageName: "mum_waldo",
      character: "Mum",
      hintBox: { x1: 77, x2: 586, y1: 0, y2: 190 },
      hitbox: { x1: 283, x2: 353, y1: 20, y2: 92 }
    },
    {
      imageName: "annabel_waldo",
      character: "Annabel",
      hintBox: { x1: 70, x2: 515, y1: 220, y2: 480 },
      hitbox: { x1: 238, x2: 296, y1: 320, y2: 369 }
    }
  ]

  public currentIWaldoImage: IWaldoImage;
  public gameStarted = false;
  public timeToFind = 45000; // ms
  public timeToStart = 5000;

  private countdownDoneEmitter: ReplaySubject<string> = new ReplaySubject<string>(1);
  private imageFoundEmitter: ReplaySubject<string> = new ReplaySubject<string>(1);

  constructor(private _snackbar: MatSnackBar,
              private _dialog: MatDialog) { }

  ngOnInit(): void {
    // this.currentIWaldoImage = this.waldoImageList[0]

  }

  private _nextImage() {
    let nextIdx = this.waldoImageList.indexOf(this.currentIWaldoImage) + 1;
    this.currentIWaldoImage = this.waldoImageList[nextIdx];
  }

  public startGame() {
    document.getElementById("countdown-container").hidden = false;
    this.gameStarted = true
    this.countdown.begin()
    this.countdown.config.leftTime = this.timeToFind / 1000
    this.countdown.config.demand = false;
    

    const imageSequenceObs = merge(this.countdownDoneEmitter, this.imageFoundEmitter)

    imageSequenceObs.subscribe((msg: string) => {
      
      
      if (msg == "done" && this.currentIWaldoImage) this.waldoImageList.push(this.currentIWaldoImage)

      console.log(this.waldoImageList)
      if (this.waldoImageList.length==0) {
        this._endGame();
        return
      } 

      this.currentIWaldoImage = this.waldoImageList.shift()
      setTimeout(() => this.countdown.restart()) // Need to use settimeout otherwise cd is just reset but doesn't start 
    })

    setTimeout( () => { 
      this.countdown.restart();
    }, this.timeToStart)

  }


  @HostListener('document:click', ['$event', '$event.target'])
  public onClick(event: MouseEvent, targetElement: HTMLElement) {
    try {
      var img = document.getElementById(this.currentIWaldoImage.imageName);
      let x = event.pageX - img.offsetLeft
      let y = event.pageY - img.offsetTop
      console.log(x, y)
      if (this.clickIsInBox(x, y, this.currentIWaldoImage.hitbox)) {
        this._findImage()
      } else if (this.clickIsInBox(x, y, this.currentIWaldoImage.hintBox)) {
        this._closeToImage()
      }
    } catch (Exception) {
      console.log(Exception.message)
    }
  }

  public onCountdownEvent(event: CountdownEvent): void {
    console.log(event)
    if (event.action == "done") {
      this.countdownDoneEmitter.next(event.action)
    }
    
  }
  private _findImage() {
    this._snackbar.open(`You've found ${this.currentIWaldoImage.character} !`, 'Dismiss', {
      duration: 1500, // ms
      panelClass: "success"
    })
    this.imageFoundEmitter.next("Image found")

  }

  private _closeToImage() {
    this._snackbar.open(`Getting close !`, 'Dismiss', {
      duration: 1500, // ms
      panelClass: "info"
    })
  }

  private clickIsInBox(x: number, y: number, { x1, x2, y1, y2 }): boolean {
    return x1 <= x && x <= x2 && y1 <= y && y <= y2
  }

  private _endGame(): void {
    this.countdown.stop()
    this._dialog.open(DialogElementComponent, {
      data: {
        title: "Success",
        content: "Nice job, you've found everyone !",
        closeMsg: "Close"
      }
    })
  }

}
