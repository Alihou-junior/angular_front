export class Assignment {
    _id!:string;
    nom!:string;
    dateDeRendu!:Date;
    rendu!:boolean;
    auteur!:string; // ID de l'utilisateur
    matiere!:string; // // ID de la matière (au lieu de l'objet complet);
    note!:number;
    remarques!:string;
}
