import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { PlayerService } from 'src/app/services/player.service';
import { Player } from 'src/app/models/models';
import { allowedNodeEnvironmentFlags } from 'process';
import { _ } from "lodash"
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {


  public playersForm: FormGroup = new FormGroup({
    playerOne: new FormControl(''),
    playerTwo: new FormControl('')
  })
  private playerSub: Subscription;
  public players: Player[];
  public btnRoute: string = "/quizz-game";
  public btnText: string = "Let's start the game"
  constructor(private playerService: PlayerService) { }


  ngOnInit(): void {
    this.playerSub = this.playerService.playersObs.subscribe((players: Player[]) => {
      if (players.every((p) => p != null)) this.players = players;
      console.log(players)
      console.log((players.every((p) => p != null)))
      console.log(this.players)
    })
  }

  public onSubmit() {
    this.playerService.createPlayers(this.playersForm.value)
  }

  ngOnDestroy(): void {
    this.playerSub.unsubscribe()
  }



}
