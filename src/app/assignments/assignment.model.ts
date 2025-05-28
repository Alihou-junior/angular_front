export class Assignment {
    _id!:string;
    nom!:string;
    dateDeRendu!:Date;
    rendu!:boolean;
    auteur!:string;
    matiere!: {
        nom : string;
        image : string;
        imageProf : string;
    };
    note!:number;
    remarques!:string;
}