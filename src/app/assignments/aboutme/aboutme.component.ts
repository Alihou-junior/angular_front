import { Component } from '@angular/core';


@Component({
  selector: 'app-aboutme',
  imports: [],
  templateUrl: './aboutme.component.html',
  styleUrl: './aboutme.component.css'
})
export class AboutmeComponent {

  currentIndex = 0;
  totalCards = 3; // Nombre total de cartes

  prevCard() {
    this.currentIndex = (this.currentIndex - 1 + this.totalCards) % this.totalCards;
  }

  nextCard() {
    this.currentIndex = (this.currentIndex + 1) % this.totalCards;
  }
}
