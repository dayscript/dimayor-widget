'use strict';
dimApp.service('CommonFunctions', function () {

    this.getRandomHash = function(){
        return Math.random().toString(32).substring(10);
    }

    this.getPhaseTranslation = function(string, number){
        switch(string){
            case 'All':
                return 'Todos contra Todos';
                break;
            case 'Round':
                return 'Ronda '+number;
                break;
            default:
                return string;
                break;
        }
    }

    this.getPositionTranslation = function(string){
        switch(string){
            case 'Midfielder':
                return 'Volante';
                break;
            case 'Striker':
            case 'Forward':
                return 'Delantero';
                break;
            case 'Substitute':
                return 'Delantero';
                break;
            default:
                return string;
                break;
        }
    }
});
