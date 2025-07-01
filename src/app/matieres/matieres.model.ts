import { users } from '../home/auth.model';

export class Matiere {
  _id!: string;
  nom!: string;
  description!: string;
  image!: string;
  responsable!: string | users; // `string` si juste l’ID, `User` si peuplé via .populate
}

