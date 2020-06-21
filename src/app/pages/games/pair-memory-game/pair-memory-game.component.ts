import { Component, OnInit, OnDestroy } from '@angular/core';
import { Card, Player} from '../../../models/models';
import _ from "lodash";
import { PlayerService } from '../../../services/player.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgPlural } from '@angular/common';
import { Subscription, timer } from 'rxjs';
import { SelectMultipleControlValueAccessor } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { GameStatus } from 'src/app/models/enums';
import { DialogElementComponent } from 'src/app/shared/dialog-element/dialog-element.component';

@Component({
  selector: 'app-pair-memory-game',
  templateUrl: './pair-memory-game.component.html',
  styleUrls: ['./pair-memory-game.component.scss']
})
export class PairMemoryGameComponent implements OnInit, OnDestroy {

  private cards: Card[];
  public currentPlayer = null;
  private firstCardPick: Card = null
  private secondCardPick: Card = null;
  public grid;
  public playerToPairsFound = {}
  public players: Player[];
  private cardsFlipping = false;
  private subs: Subscription = new Subscription();
  public gameStatus: GameStatus = GameStatus.START
  public gameStatusEnum: typeof GameStatus = GameStatus


  constructor(private playerService: PlayerService,
              private _snackBar: MatSnackBar,
              private _dialog: MatDialog) { 

  }

  ngOnInit(): void {
    this.cards = this.getCardList();
    this.grid = this.makeGrid(this.cards);
    
    this.subs.add(
      this.playerService.playersObs.subscribe((players: Player[]) => {
        this.players = players
        this.currentPlayer = _.shuffle(players)[0]
        this.intializePlayertoPairsFound(players);
      })
    )


  }

  private intializePlayertoPairsFound(players: Player[]) {
    for (let p of players) {
      this.playerToPairsFound[p.name] = 0
    }
  }
  private getCardList(): Card[] {
    var cardList: Card[] = []
    let fileNames = ["clara1", "clara2", "mama1", "nana", "nana2", "papa1", "tim1", "tim2", "papamaman"];
    fileNames = fileNames.map(fn => "assets/pair_memory_game/" + fn + ".PNG")

    for (let fn of fileNames) {
      // Add twice a card with same img / color with versions 0 and 1 -> pair 
      // const imgPath = imagesPath[i]
      cardList.push(new Card(0, fn))
      cardList.push(new Card(1, fn))

    }
    console.log(cardList)
    return cardList;
  }

  private makeGrid(cards: Card[]): Array<Array<Card>> {
    const shuffledCards = _.shuffle(cards);
    const lengthWidth = this._getLengthWidth(cards.length)
    const height = Math.min(...lengthWidth)
    const width = Math.max(...lengthWidth)
    var grid:  Array<Array<Card>> = []
    for (let i = 0; i<height; i++) {
      grid[i] = []
      for (let j=0; j<width; j++) {
        grid[i].push(shuffledCards.pop())
      }
    }
    console.log(grid)

    return grid;

  }

  private _getLengthWidth(length: number) {
    let min_diff = length
    let best_couple;
    for (let d = 1; d < Math.floor(length/2); d++) {
        let q = length/d
        if (q == Math.floor(q)) {
            min_diff = Math.max(q-d, d-q)
            best_couple = [d, q]
        }
    }
    return best_couple
  }

  public selectCard(card: Card) {

    // Handle errors : card already selected or pair already found 
    if (card.selected || card.foundPair) {
      let message = card.foundPair ? "Pair already found" : "Card already selected"
      this.openSnackBar(message);
      return
    }

    else if (this.cardsFlipping) {
      this.openSnackBar("Wait until cards have flipped")
      return
    }

    card.selected = true

    if (this.firstCardPick) {
      this.secondCardPick = card;
      const pairFound = this.checkMatch(this.firstCardPick, this.secondCardPick);
      this.nextTurn(pairFound);
    } else {
     this.firstCardPick = card; 
    }
    
  }

  private checkMatch(firstPick: Card, secondPick: Card): boolean {
    console.log(firstPick)
    if (firstPick.imgPath == secondPick.imgPath) {
      this.firstCardPick.foundPair = true
      this.secondCardPick.foundPair = true
      this.playerToPairsFound[this.currentPlayer.name] += 1
      return true
    } 

    return false
  }

  private resetPicks() {
    this.firstCardPick.selected = false;
    this.secondCardPick.selected = false;
    this.firstCardPick = null;
    this.secondCardPick = null;
  }

  private nextTurn(pairFound: boolean) {
    let cardsLeft = this.cards.filter((card: Card) => !card.foundPair);
    console.log(cardsLeft)
    if (cardsLeft.length == 0) {
      setTimeout( () => this.endGame(), 2000);
    }
    
    // If pair not found, flip cards and other player's turn to play
    if (pairFound) {
      this.resetPicks();
    } else {
      // Timeout to see the second card before it flips back
      const secondImgTimeout = 2000;
      this.cardsFlipping = true;
      setTimeout(() => {
        this.resetPicks();
        this.currentPlayer = this.players.filter(p => this.currentPlayer.name != p.name)[0];
        this.cardsFlipping = false;
      }, secondImgTimeout)
    }

    


  }

  private endGame() {
    let winner = this.players.reduce((best, current) => (this.playerToPairsFound[best.name] > this.playerToPairsFound[current.name]) ? best : current)
    let winnerName = winner.name;
    let winnerPoints = this.playerToPairsFound[winnerName]
    this.playerService.addPoints(this.playerToPairsFound);
    this.gameStatus = GameStatus.END
    this._dialog.open(DialogElementComponent, {
      data: {
        title: "End of the game",
        content: winnerName + " has won with " + winnerPoints + " points !",
        closeMsg: "Close"
      }
    })
  }
  private openSnackBar(message: string ) {
    this._snackBar.open(message, "Dismiss", {
      duration: 2000 // ms
    });
  }

  ngOnDestroy()  {
    this.subs.unsubscribe()
  }

}
