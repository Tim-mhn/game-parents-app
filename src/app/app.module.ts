import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PairMemoryGameComponent } from './pages/games/pair-memory-game/pair-memory-game.component';
import { FlexLayoutModule } from "@angular/flex-layout";
import { CardComponent } from './pages/games/pair-memory-game/card/card.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatCardModule } from '@angular/material/card';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { QuizzGameComponent } from './pages/games/quizz-game/quizz-game.component';
import { RouterModule } from '@angular/router';
import {MatChipsModule} from '@angular/material/chips';
import { CountdownModule } from 'ngx-countdown';
import {MatButtonModule} from '@angular/material/button';
import { FindWallyGameComponent } from './pages/games/find-wally-game/find-wally-game.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import {MatDialogModule} from '@angular/material/dialog';
import { DialogElementComponent } from './shared/dialog-element/dialog-element.component';

@NgModule({
  declarations: [
    AppComponent,
    PairMemoryGameComponent,
    CardComponent,
    QuizzGameComponent,
    FindWallyGameComponent,
    DialogElementComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatSnackBarModule,
    MatChipsModule,
    MatButtonModule,
    CountdownModule,
    MatToolbarModule,
    MatIconModule,
    MatDialogModule,
    RouterModule.forRoot([
      { path: 'pair-memory-game', component: PairMemoryGameComponent },
      { path: 'quizz-game', component: QuizzGameComponent },
      { path: 'find-wally-game', component: FindWallyGameComponent }

    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
