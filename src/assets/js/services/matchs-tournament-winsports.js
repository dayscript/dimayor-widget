dimApp.service('MatchsTournamentWinsports', ['$http', function ($http) {		
     var promise;		
     var last_tournament = 0;		
     var matchs = {		
         async: function (id_tournament) {		
             if (!promise || last_tournament != id_tournament) {		
                 promise = $http.get('//s3-us-west-2.amazonaws.com/winsports-new/json_nodequeue/' + id_tournament + '.json').then(function (response) {		
                     return response.data.nodes;		
                 });		
                 last_tournament = id_tournament;		
             }		
             return promise;		
         }		
     };		
     return matchs;		
 }]);