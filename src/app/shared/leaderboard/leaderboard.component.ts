import { Component, OnInit } from '@angular/core';
import { PlayerService } from 'src/app/services/player.service';
import { Subscription } from 'rxjs';
import { Player } from 'src/app/models/models';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {

  playerSub: Subscription;
  public players: Player[];
  constructor(private playerService: PlayerService) { }

  ngOnInit(): void {
    this.playerSub = this.playerService.playersObs.subscribe((players: Player[]) => {
      if (players.every((p) => p != null)) this.players = players;
      console.log(players)
      console.log((players.every((p) => p != null)))
      console.log(this.players)
    })
  }

}
