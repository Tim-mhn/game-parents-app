import { Injectable } from '@angular/core';
import { Player } from '../models/models';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  private player1: Player;
  private player2: Player;

  private _playersSubj: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]> ([]);
  public playersObs: Observable<Player[]> = this._playersSubj.asObservable(); 

  constructor() {
    this.player1 = new Player("Bob");
    this.player2 = new Player("Doug");
    this._playersSubj.next([this.player1, this.player2])
   }
}
