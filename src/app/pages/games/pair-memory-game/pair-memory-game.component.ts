import { Component, OnInit, OnDestroy } from '@angular/core';
import { Card, Player} from '../../../models/models';
import _ from "lodash";
import { PlayerService } from '../../../services/player.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgPlural } from '@angular/common';
import { Subscription, timer } from 'rxjs';
import { SelectMultipleControlValueAccessor } from '@angular/forms';

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

  private subs: Subscription = new Subscription();

  constructor(private playerService: PlayerService,
              private _snackBar: MatSnackBar) { 

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
    const colors = ["blue", "green", "black", "yellow"]
    let imagesPath = ["https://img.webmd.com/dtmcms/live/webmd/consumer_assets/site_images/article_thumbnails/other/cat_relaxing_on_patio_other/1800x1200_cat_relaxing_on_patio_other.jpg"]
    imagesPath.push("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyUhTVCj60quboNSvY4C1iPi45GckIKGo3qi9kQW9HtFvTRBiBrw&s")
    imagesPath.push("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRatFPpthGUTU3_LtepVkTxVjRESA2By3HOkCUyliHgOuolOQyn&s")
    imagesPath.push("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvqdqoXwNrfuCfS_FWBhdMq551x7FzdGCklOciRPw9f5Fn0cCz&s")
    
    for (let [i, color] of colors.entries()) {
      // Add twice a card with same img / color with versions 0 and 1 -> pair 
      const imgPath = imagesPath[i]
      cardList.push(new Card(color, 0, imgPath))
      cardList.push(new Card(color, 1, imgPath))

    }
    return cardList;
  }

  private makeGrid(cards: Card[]): Array<Array<Card>> {
    const shuffledCards = _.shuffle(cards);
    
    var length = Math.floor(Math.sqrt(cards.length));
    var width = cards.length / length;
    var grid:  Array<Array<Card>> = []
    for (let i = 0; i<length; i++) {
      grid[i] = []
      for (let j=0; j<width; j++) {
        grid[i].push(shuffledCards.pop())
      }
    }

    return grid;

  }

  public selectCard(card: Card) {
    console.log("select card called !")

    // Handle errors : card already selected or pair already found 
    if (card.selected || card.foundPair) {
      let message = card.foundPair ? "Pair already found" : "Card already selected"
      this.openSnackBar(message);
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
    if (firstPick.color == secondPick.color) {
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
      this.endGame()
    }
    
    // If pair not found, flip cards and other player's turn to play
    if (pairFound) {
      this.resetPicks();
    } else {
      // Timeout to see the second card before it flips back
      const secondImgTimeout = 2000;
      setTimeout(() => {
        this.resetPicks();
        this.currentPlayer = this.players.filter(p => this.currentPlayer.name != p.name)[0]
      }, secondImgTimeout)
    }

    


  }

  private endGame() {
    let winner = this.players.reduce((best, current) => (this.playerToPairsFound[best.name] > this.playerToPairsFound[current.name]) ? best : current)
    this.openSnackBar("Winner is " + winner.name + " with " + this.playerToPairsFound[winner.name] + " pairs")
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
