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
  public gameStarted = false;
  public gameEnded = false;
  
  public playerKeys = [["a", "e"], ["1", "3"]];
  public timeToAnswer = 5000;
  public timeToStart = 3000; // 3..2..1 before starting 
  constructor(private playerService: PlayerService,
              private _snackBar: MatSnackBar) { }

  ngOnInit(): void {

    this.subs.add(
      this.playerService.playersObs.subscribe((players: Player[]) => {
        this.players = players
        console.log(this.players)
        players.forEach((p, i) => {
          this.playerToPoints[p.name] = 0;
          this.playerToKeys[p.name] = i == 0 ? ["a", "e"] : ["1", "3"]
          console.log(this.playerToPoints)
        }); // Initialize players points to 0
      })
    )

    this.IQuizQuestions = this.getIQuizQuestions();
    // TODO: replace this by a start quiz action button 
  }


  private getIQuizQuestions(): IQuizQuestion[] {
    let IQuizQuestions: IQuizQuestion[] = []

    IQuizQuestions.push( { question: 'Capital of France ? ', choices: ['Paris', 'Marseille'], 'answer': 0 })
    IQuizQuestions.push( { question: 'Most populated city ? ', choices: ['Tokyo', 'Delhi'], 'answer': 0 })
    IQuizQuestions.push( { question: 'Smallest country ?', choices: ['San Marino', 'Vatican'], 'answer': 1 })
    IQuizQuestions.push( { question: 'Nationality of Chopin ?', choices: ['Polish', 'Hungarian'], 'answer': 0 })
    IQuizQuestions.push( { question: 'Capital of Washington State', choices: ['Seattle', 'Olympia'], 'answer': 1 })
    IQuizQuestions.push( { question: 'Highest army budget per capita ?', choices: ['Israel', 'Saudi Arabia'], 'answer': 1 })
    IQuizQuestions.push({ question: 'End of quiz', choices: [], answer: 0 })
    return IQuizQuestions;
  }

  public startQuiz(): void {

    this.gameStarted = true;
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
    this._snackBar.open("Winner is " + winner.name + " with " + this.playerToPoints[winner.name] + " points !")
    let playerToPoints: Map<string, number> = <Map<string, number>> this.playerToPoints
    this.playerService.addPoints(playerToPoints);
    this.gameEnded = true;
  }

}
