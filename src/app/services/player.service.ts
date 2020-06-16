import { Injectable } from '@angular/core';
import { Player } from '../models/models';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  

  private _playersSubj: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]> ([null, null]);
  public playersObs: Observable<Player[]> = this._playersSubj.asObservable();

  constructor() {
   }

   public createPlayers({playerOne, playerTwo }) {
    let player1 = new Player(playerOne);
    let player2 = new Player(playerTwo);
    this._playersSubj.next([player1, player2])

    console.log(this._playersSubj)
   }

   public addPoints(playerToPts: Map<string, number> | Object) {
    let players = this._playersSubj.value;
    Object.entries(playerToPts).forEach(([playerName, points]) => {
        let playerToAdd = players.filter(p => p.name == playerName)[0]
        playerToAdd.addPoints(points)
    })

    console.log(players)
    this._playersSubj.next(players)
   }
}
