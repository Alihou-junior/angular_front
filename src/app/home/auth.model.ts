export class users {
    _id!:string;
    username!:string;
    name!:string;
    surname!:string;
    email!:string;
    password!:string;
    createdAt!:Date;
    role!: 'user' | 'admin';
    image!: string;

}
