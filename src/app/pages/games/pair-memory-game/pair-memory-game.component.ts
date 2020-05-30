import { Component, OnInit, OnDestroy } from '@angular/core';
import { Card, Player} from '../../../models/models';
import _ from "lodash";
import { PlayerService } from '../../../services/player.service';

import { NgPlural } from '@angular/common';
import { Subscription } from 'rxjs';

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

  constructor(private playerService: PlayerService) { 

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
    const colors = ["blue", "green", "black", "yellow", "red", "pink"]
    for (let c of colors) {
      // Add twice a card with same img / color with versions 0 and 1 -> pair 
      cardList.push(new Card(c, 0))
      cardList.push(new Card(c, 1))

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
    if (this.firstCardPick) {
      this.secondCardPick = card;
      this.checkMatch(this.firstCardPick, this.secondCardPick);
      this.nextTurn();
    } else {
     this.firstCardPick = card; 
    }
    
  }

  private checkMatch(firstPick: Card, secondPick: Card) {
    console.log(firstPick)
    if (firstPick.color == secondPick.color) {
      this.firstCardPick.foundPair = true
      this.secondCardPick.foundPair = true
      this.playerToPairsFound[this.currentPlayer.name] += 1

    } 
  }

  private resetPicks() {
    this.firstCardPick = null;
    this.secondCardPick = null;
  }

  private nextTurn() {
    this.resetPicks();
    this.currentPlayer = this.players.filter(p => this.currentPlayer.name != p.name)[0]
  }

  ngOnDestroy()  {
    this.subs.unsubscribe()
  }

}
