import { Component, OnInit, HostListener, ViewChild, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { PlayerService } from 'src/app/services/player.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, zip, of, timer, from } from 'rxjs';
import { endWith, delay } from 'rxjs/operators';
import { Player, IQuizQuestion } from 'src/app/models/models';
import _ from "lodash";
import { strict } from 'assert';
import { pipeFromArray } from 'rxjs/internal/util/pipe';
import { CountdownComponent } from 'ngx-countdown';
import { GameStatus } from 'src/app/models/enums';
import { DialogElementComponent } from 'src/app/shared/dialog-element/dialog-element.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-quizz-game',
  templateUrl: './quizz-game.component.html',
  styleUrls: ['./quizz-game.component.scss']
})
export class QuizzGameComponent implements OnInit {

  @ViewChild('cd', {static: false }) private countdown: CountdownComponent;

  public players: Player[];
  private subs: Subscription = new Subscription();

  private IQuizQuestions: IQuizQuestion[];
  public currentQuestion: IQuizQuestion;

  public questionToAnswerHistory: {} = {};
  public playerToPoints = {};
  public playerToKeys = {}
  public gameStatus: GameStatus = GameStatus.START
  public gameStatusEnum: typeof GameStatus = GameStatus
  public playerKeys = [["a", "e"], ["1", "3"]];
  public timeToAnswer = 5000;
  public timeToStart = 3000; // 3..2..1 before starting 
  constructor(private playerService: PlayerService,
              private _snackBar: MatSnackBar,
              private _dialog: MatDialog) { }

  ngOnInit(): void {

    this.subs.add(
      this.playerService.playersObs.subscribe((players: Player[]) => {
        this.players = players
        console.log(this.players)
        players.forEach((p, i) => {
          this.playerToPoints[p.name] = 0;
          this.playerToKeys[p.name] = i == 0 ? ["a", "e"] : ["1", "3"]
          // console.log(this.playerToPoints)
        }); // Initialize players points to 0
      })
    )

    this.IQuizQuestions = this.getIQuizQuestions();
  }


  private getIQuizQuestions(): IQuizQuestion[] {
    let IQuizQuestions: IQuizQuestion[] = []
    const baseQuestion = 'Qui est le plus susceptible de '
    IQuizQuestions.push( { question: baseQuestion + 'ne pas se doucher pendant une semaine ?', choices: ['Clara', 'Annabel'], 'answer': 1 })
    IQuizQuestions.push( { question: baseQuestion +'s\'énerver après avoir perdu un jeu de cartes ?', choices: ['Papa', 'Annabel'], 'answer': 0 })
    IQuizQuestions.push( { question: baseQuestion +'dormir pendant 24h d\'affilées ?', choices: ['Tim', 'Annabel'], 'answer': 1 })
    IQuizQuestions.push( { question: baseQuestion +'ne pas bien digérer l\'aïoli ?', choices: ['Maman', 'Clara'], 'answer': 0 })
    IQuizQuestions.push( { question: baseQuestion +'ne pas aimer les gens gros ?', choices: ['Tim', 'Annabel'], 'answer': 0 })
    IQuizQuestions.push( { question: baseQuestion +'être grosse ?', choices: ['Clara', 'Annabel'], 'answer': 0 })
    IQuizQuestions.push( { question: baseQuestion +'se prendre un arbre en marchant ?', choices: ['Papouille', 'Clara'], 'answer': 1 })
    IQuizQuestions.push( { question: baseQuestion +'faire fuir Papouille par son odeur ?', choices: ['Annabel', 'Tim'], 'answer': 0 })
    IQuizQuestions.push( { question: baseQuestion +'chasser Papouille cruellement ?', choices: ['Tim', 'Clara'], 'answer': 0 })
    IQuizQuestions.push( { question: baseQuestion +'jouer avec Papouille dans l\'escalier ?', choices: ['Clara', 'Papa'], 'answer': 1 })
    IQuizQuestions.push( { question: baseQuestion +'dire "ah j\'ai un coup de bar!" ?', choices: ['Israel', 'Saudi Arabia'], 'answer': 1 })
    IQuizQuestions.push( { question: baseQuestion +'faire une blague presque drôle ?', choices: ['Annabel', 'Papa'], 'answer': 1 })
    IQuizQuestions.push( { question: baseQuestion +'tomber d\'une baignoire ?', choices: ['Clara', 'Maman'], 'answer': 0 })
    IQuizQuestions.push( { question: baseQuestion +'se faire mordre les fesses par Pouille ?', choices: ['Annabel', 'Clara'], 'answer': 1 })
    IQuizQuestions.push({ question: 'End of quiz', choices: [], answer: 0 })
    return IQuizQuestions;
  }

  public startQuiz(): void {

    this.gameStatus = GameStatus.PROGRESS;
    this.countdown.begin() // Need to call this as config.demand = true
    // Edit config to use countdown to show remaining time to answer questions 
    this.countdown.config.leftTime = this.timeToAnswer / 1000
    this.countdown.config.demand = false;

    const timerQuestionsObs = zip(
      from(this.IQuizQuestions),
      timer(this.timeToStart, this.timeToAnswer)
    )
    
    timerQuestionsObs.subscribe(([q, i]) => { 
      // Restart countdown at each question (except final one)
      if (q.question != 'End of quiz') {
        this.countdown.restart()
      } else {
        this.endQuiz()
      }

      // Check final answers for previous question and add points if correct 
      if (this.currentQuestion) {
        Object.entries(this.questionToAnswerHistory[i-1]).forEach(v => {
          let [player, answer] = v
          if (answer == this.currentQuestion.answer) this.playerToPoints[player] += 1;
        })
      }

      // New current question
      this.currentQuestion = q;
      this.questionToAnswerHistory[i] = {}

    });
  }


  @HostListener('document: keydown', ['$event'])
  public answerQuestion(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    const player0keys = ['a', 'e'];
    const player1keys = ['1', '3'];

    let answeringPlayer, answer;
    if (player0keys.includes(key)) {
      answeringPlayer = this.players[0]
      answer = player0keys.indexOf(key)    
    } else if (player1keys.includes(key)) {
      answeringPlayer = this.players[1]
      answer = player1keys.indexOf(key)  
    } else {
      console.warn("key is not in arrays " + key)
      return 
    }



    this.playerAnswers(answeringPlayer, answer)
  }

  private playerAnswers(player: Player, answer: number) {
    const currentQuestionIndex = this.IQuizQuestions.indexOf(this.currentQuestion);
    // Instead of directly adding point, we let the player change his answer until countdown is over
    // In the timerQuestionsObs subscription callback, we check players answers and add points if correct 
    this.questionToAnswerHistory[currentQuestionIndex][player.name] = answer;
    this._snackBar.open(player.name + " answered to question " + currentQuestionIndex.toString() + "  : answer", "Dismiss", {
      duration: 500 // ms
    });
  }

  private endQuiz() {
    let winner = this.players.reduce((best, current) => (this.playerToPoints[best.name] > this.playerToPoints[current.name]) ? best : current)
    let playerToPoints: Map<string, number> = <Map<string, number>> this.playerToPoints
    let winnerName = winner.name;
    let winnerPoints = playerToPoints[winnerName]
    this.playerService.addPoints(playerToPoints);
    this.gameStatus = GameStatus.END
    this._dialog.open(DialogElementComponent, {
      data: {
        title: "End of the game",
        content: winnerName + " has won with " + winnerPoints + " points !",
        closeMsg: "Close"
      }
    })
  }

}
