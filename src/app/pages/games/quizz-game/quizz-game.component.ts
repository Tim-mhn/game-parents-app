import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { PlayerService } from 'src/app/services/player.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, zip, of, timer, from } from 'rxjs';
import { endWith, delay } from 'rxjs/operators';
import { Player, QuizQuestion } from 'src/app/models/models';
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

  @ViewChild('cd', { static: false }) private countdown: CountdownComponent;
  
  public players: Player[];
  private subs: Subscription = new Subscription();

  private quizQuestions: QuizQuestion[];
  public currentQuestion: QuizQuestion;

  public questionToAnswerHistory: {} = {};
  public playerToPoints = {}

  public timeToAnswer = 5000;
  constructor(private playerService: PlayerService,
              private _snackBar: MatSnackBar) { }

  ngOnInit(): void {

    this.subs.add(
      this.playerService.playersObs.subscribe((players: Player[]) => {
        this.players = players
        players.forEach(p => this.playerToPoints[p.name] = 0); // Initialize players points to 0
      })
    )

    this.quizQuestions = this.getQuizQuestions();
    
    // TODO: replace this by a start quiz action button 
    // setTimeout( () => this.startQuiz, 100);
    this.startQuiz()
  }



  private getQuizQuestions(): QuizQuestion[] {
    let quizQuestions: QuizQuestion[] = []

    quizQuestions.push( { question: 'Capital of France ? ', choices: ['Paris', 'Marseille'], 'answer': 0 })
    quizQuestions.push( { question: 'Most populated city ? ', choices: ['Tokyo', 'Delhi'], 'answer': 0 })
    quizQuestions.push( { question: 'Smallest country ?', choices: ['San Marino', 'Vatican'], 'answer': 1 })
    quizQuestions.push( { question: 'Nationality of Chopin ?', choices: ['Polish', 'Hungarian'], 'answer': 0 })
    quizQuestions.push( { question: 'Capital of Washington State', choices: ['Seattle', 'Olympia'], 'answer': 1 })
    quizQuestions.push( { question: 'Highest army budget per capita ?', choices: ['Israel', 'Saudi Arabia'], 'answer': 1 })
    quizQuestions.push({ question: 'End of quiz', choices: [], answer: 0 })
    return quizQuestions;
  }

  private startQuiz(): void {

    const timerQuestionsObs = zip(
      from(this.quizQuestions),
      timer(2000, this.timeToAnswer)
    )
    
    timerQuestionsObs.subscribe(([q, i]) => { 
      console.log(q, i);
      console.log(this.currentQuestion)
      if (this.currentQuestion) {
        if (q.question != 'End of quiz') this.countdown.restart()
        Object.entries(this.questionToAnswerHistory[i-1]).forEach(v => {
          let [player, answer] = v
          if (answer == this.currentQuestion.answer) this.playerToPoints[player] += 1;
        })
      }

      
      if (q) this.currentQuestion = q;
      this.questionToAnswerHistory[i] = {}

    });
  }


  @HostListener('document: keydown', ['$event'])
  private answerQuestion(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    console.log(key)
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
      console.log("key is not in arrays " + key)
      return 
    }

    console.log(answeringPlayer, answer)


    this.playerAnswers(answeringPlayer, answer)
  }

  private playerAnswers(player: Player, answer: number) {
    const currentQuestionIndex = this.quizQuestions.indexOf(this.currentQuestion);
    console.log(this.questionToAnswerHistory)
    console.log(currentQuestionIndex)
    this.questionToAnswerHistory[currentQuestionIndex][player.name] = answer;
    // if (answer == this.currentQuestion.answer) {
    //   this.playerToPoints[player.name] += 1
    // }
    this._snackBar.open(player.name + " answered to question " + currentQuestionIndex.toString() + "  : answer", "Dismiss", {
      duration: 500 // ms
    });
  }

}
