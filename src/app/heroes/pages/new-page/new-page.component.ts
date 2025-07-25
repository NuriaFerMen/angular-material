import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { Hero, Publisher } from '../../interfaces/hero.interface';
import { HeroesService } from '../../services/heroes.service';
import { filter, switchMap } from 'rxjs';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';




@Component({
  selector: 'app-new-page',
  standalone: false,
  templateUrl: './new-page.component.html',
  styles: ``
})
export class NewPageComponent implements OnInit {

  public heroForm = new FormGroup({
      id:               new FormControl<string>(''),
      superhero:        new FormControl<string>('', { nonNullable: true }),
      publisher:        new FormControl<Publisher>(Publisher.DCComics ),
      alter_ego:        new FormControl(''),
      first_appearance: new FormControl(''),
      characters:       new FormControl(''),
      alt_img:          new FormControl(''),
  });

  public publishers = [
    { id: 'DC Comics', desc: 'DC - Comics' },
    { id: 'Marvel Comics', desc: 'Marvel - Comics' },
  ];

  constructor(
    private heroesService: HeroesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  )    {}


  ngOnInit(): void {
    if (!this.router.url.includes('edit')) return;

    this.activatedRoute.params
      .pipe(
        switchMap(({id}) => this.heroesService.getHeroById(id)),
      ).subscribe( hero => {
        if (!hero) return this.router.navigateByUrl('/');

        this.heroForm.reset(hero);
        return;
      })
  }


  get currenthero(): Hero {
    const hero = this.heroForm.value as Hero;

    return hero;
  }

  onSubmit(): void{
    if(this.heroForm.invalid) return;

    if ( this.currenthero.id){
      this.heroesService.updateHero(this.currenthero)
        .subscribe( hero => {
          // mostrar snacbar
          this.showSnackBar(`${ hero.superhero } updated!`);
        });
        return;
    }

    this.heroesService.addHero(this.currenthero)
      .subscribe( hero => {
        //  mostrar snacbar, y navegar a /heroes/edit/hero.id
        this.router.navigate(['/hero/edit', hero.id]);
        this.showSnackBar(`${ hero.superhero } created!`);
      })
  }

  onDeleteHero(){
    if (!this.currenthero.id) throw Error('Hero id is required');

     const dialogRef = this.dialog.open( ConfirmDialogComponent, {
      data: this.heroForm.value
    });

    dialogRef.afterClosed()
      .pipe(
        filter( (result: boolean) => result ),
        switchMap( () => this.heroesService.deleteHeroById( this.currenthero.id )),
        filter( (wasDeleted: boolean) => wasDeleted ),
      )
      .subscribe(() => {
        this.router.navigate(['/heroes']);
      });
  }

  showSnackBar(message: string): void{
    this.snackBar.open(message, 'done', {
      duration:2500,
    })
  }
}
