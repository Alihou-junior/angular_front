# AssignmentApp - Frontend

Ce projet est une interface web developpée avec [Angular CLI](https://github.com/angular/angular-cli) version 19.1.5 permttant la gestion de devoir. Il est couplé avec un backend node.js/MongoDB

## Conditions prealables
Pour installer ce projet , vous aures besoin de : 
- [Node.js](https://nodejs.org/en/) > v17
- Angular (https://angular.dev/)


Installation de Node et npm : 
```bash
    sudo apt install nodejs npm
    node -v 
    npm -v 
    npm install -g @angular/cli
    ng version
```


<br>

## Installation 
#### cloner le depot 
```bash 
git clone https://github.com/votre_utilisateur/frontend-assignments.git
cd frontend-assignments
```

#### Installer les dependances
```bash 
npm install
```

#### Demarrer le serveur Angular localement
```bash 
ng serve
```
#### Acceder à l'application
Une fois le serveur demarré, Ouvrez votre navigateur à l'addresse ```http://localhost:4200 ``` L'application mettra à jour vos modifications en temps réel.

<br>

#### Execution de tests
Les test e2e(end-to-end) verifient que l'application fonctionne du point de vue de l'user .
```ng e2e```


## Deploiement 
Pour deployer le projet en production, il faut :
- Compiler l'application 
```bash 
ng build --configuration production 
```
- le dossier ```dist/assignment-app/``` genéré peut etre servi par un serveur Node, Express ou un hebergeur statique
- Utilisez simplement la commande ```node server.js``` pour utiliser le server Express en dans votre terminal.


Apres lancement (sur Express par example), vous aurez acces à l'application localemnt à l'addresse ```http://localhost:4200/main/assignments```.

<br>

## Construit avec
- Angular - Framework web Frontend
- RxJS - Programmation reactive
- Bootstrap - Design reactif 
- Angular Material - Composant UI

<br>

## Auteurs 
- [Alihou-junior](https://github.com/Alihou-junior)
- [capatainkomic](https://github.com/capatainkomic)

<br>

## Remerciements
- A l'equipe MBDS pour le sujet
- A mes collegues testeurs anonymes
