dimApp.controller('WidgetDimStatisticsController',
    ['$scope', '$interval', '$filter', '$http', 'CommonFunctions','MatchsTournamentWinsports',
    function ($scope, $interval, $filter, $http, CommonFunctions, MatchsTournamentWinsports) {

    $scope.events = {};

    $http.get('//s3-us-west-2.amazonaws.com/dimayor-opta-feeds/tournaments/widget-win-tournament.json',{
        headers: {
            'Cache-Control' : 'no-cache'
        }
    }).then(function(response){
        $scope.tabs = response.data;
        $scope.seasons = response.data[0].seasons;
        $scope.getTournament(response.data[0]);
    });

    $scope.getTournament = function(tournament){
        $(".widget-dim-content .loadlayer").show(0);
        $scope.tournament = tournament;
        $scope.seasons = tournament.seasons;
        $scope.active_tournament_tabs = tournament.tabs;
        $scope.getData(tournament.id, tournament.season, tournament.tabs[1]);
    }

    $scope.getData = function(id, season, service){
        $(".widget-dim-content .loadlayer").show(0);
        $scope.active_tournament_tab = service;
        $scope.tournament.id = id;
        $scope.tournament.season = season;

        if(service.id == "reclassification"){
            $http.get('https://s3-us-west-2.amazonaws.com/dimayor-opta-feeds/reclassification/'+id+'/'+season+'/all.json',{
                headers: {
                    'Cache-Control' : 'no-cache'
                }
            }).then(function(response){

                $scope.reclassification = [];
                var equipos = [];
                var competition = response.data;
                var i = 0;
                angular.forEach(competition.teams, function(team, team_id) {
                    var aux =  [];
                    aux.id = team.pos;
                    aux.data = team;
                    equipos.push(aux);
                    i++;
                });
                $scope.reclassification = equipos;
                $(".widget-dim-content .loadlayer").hide(0);
            }, function(response){
                $(".widget-dim-content .loadlayer").hide(0);
            });
        }

        if(service.id == "schedules"){
            $http.get('https://s3-us-west-2.amazonaws.com/dimayor-opta-feeds/summary/'+id+'/'+season+'/all.json',{
                headers: {
                    'Cache-Control' : 'no-cache'
                }
            }).then(function(response){
                /*$scope.trnmnt = id;
                if(response.data.competition)
                    console.log(response);{*/
                    $scope.rounds = [];
                    $scope.round = null;
                    var index = 0;
                    var competition = response.data;

                    angular.forEach(competition.phases, function(phase, phase_id) {
                        angular.forEach(phase.rounds, function(round, round_id) {

                            $scope.rounds.push({
                                id: round_id,
                                name: CommonFunctions.getPhaseTranslation(phase.phase.type, phase.phase.number)+' - '+'Fecha '+round.number,
                                id_round: round.number
                            });

                            if(phase.phase.id == competition.competition.active_phase_id && round.id == competition.competition.active_round_id){
                                $scope.round = $scope.rounds[index];
                                $scope.getSchedulesMatches(id, season, $scope.round);
                            }

                            index++;
                        });
                    });

                    if($scope.round == null){
                        $scope.round = $scope.rounds[index-1];
                        $scope.getSchedulesMatches(id, season, $scope.round);
                    }
                /*}else{*/
                    $(".widget-dim-content .loadlayer").hide(0);
                /*}*/

            }, function(response){
                $(".widget-dim-content .loadlayer").hide(0);
            });
        }

        if(service.id == "positions"){
            $http.get('https://s3-us-west-2.amazonaws.com/dimayor-opta-feeds/summary/'+id+'/'+season+'/all.json',{
                headers: {
                    'Cache-Control' : 'no-cache'
                }
            }).then(function(response){
                /*$scope.trnmnt = id;
                if(response.data.competition){*/
                    var phase_id = response.data.competition.active_phase_id;
                    $scope.phases = [];

                    angular.forEach(response.data.phases, function(phase, key) {
                        var temp = {
                            id: key,
                            name: CommonFunctions.getPhaseTranslation(phase.phase.type, phase.phase.number)
                        };

                        $scope.phases.push(temp);

                        if(key == phase_id){
                            $scope.phase = temp;
                        }
                    });

                    $scope.getPositions(id, season, $scope.phase);
                /*}else{*/
                    $(".widget-dim-content .loadlayer").hide(0);
                /*}*/
            }, function(response){
                $(".widget-dim-content .loadlayer").hide(0);
            });
        }

        if(service.id == "scorers"){
            $http.get('//s3-us-west-2.amazonaws.com/dimayor-opta-feeds/scorers/'+id+'/'+season+'/all.json',{
                headers: {
                    'Cache-Control' : 'no-cache'
                }
            }).then(function(response){

                $scope.scorers = [];

                angular.forEach(response.data.scorers, function(player, player_id) {
                    player.position = CommonFunctions.getPositionTranslation(player.position);
                    $scope.scorers.push(player);
                });

                $scope.scorers = $filter('orderBy')($scope.scorers, 'pos', false);
                $(".widget-dim-content .loadlayer").hide(0);
            }, function(response){
                $(".widget-dim-content .loadlayer").hide(0);
            });
        }

        if(service.id == "decline"){
            $http.get('//s3-us-west-2.amazonaws.com/dimayor-opta-feeds/decline/'+id+'/'+season+'/all.json',{
                headers: {
                    'Cache-Control' : 'no-cache'
                }
            }).then(function(response){

                $scope.decline = [];

                angular.forEach(response.data.teams, function(team, team_id) {
                    $scope.decline.push(team);
                });

                $scope.decline = $filter('orderBy')($scope.decline, '-pos', false);
                $(".widget-dim-content .loadlayer").hide(0);
            }, function(response){
                $(".widget-dim-content .loadlayer").hide(0);
            });

        }
    };



    $scope.getSeasons = function(id, season, service){
        $(".widget-dim-content .loadlayer").show(0);
        $scope.active_tournament_tab = service;

        if(service.id == "reclassification"){
            $http.get('https://s3-us-west-2.amazonaws.com/dimayor-opta-feeds/reclassification/'+id+'/'+season+'/all.json',{
                headers: {
                    'Cache-Control' : 'no-cache'
                }
            }).then(function(response){

                $scope.reclassification = [];
                var equipos = [];
                var competition = response.data;
                var i = 0;
                angular.forEach(competition.teams, function(team, team_id) {
                    var aux =  [];
                    aux.id = team.pos;
                    aux.data = team;
                    equipos.push(aux);
                    i++;
                });
                $scope.reclassification = equipos;
                $(".widget-dim-content .loadlayer").hide(0);
            }, function(response){
                $(".widget-dim-content .loadlayer").hide(0);
            });
        }

        if(service.id == "schedules"){
            $http.get('https://s3-us-west-2.amazonaws.com/dimayor-opta-feeds/summary/'+id+'/'+season+'/all.json',{
                headers: {
                    'Cache-Control' : 'no-cache'
                }
            }).then(function(response){
                /*$scope.trnmnt = id;
                if(response.data.competition)
                    console.log(response);{*/
                    $scope.rounds = [];
                    $scope.round = null;
                    var index = 0;
                    var competition = response.data;

                    angular.forEach(competition.phases, function(phase, phase_id) {
                        angular.forEach(phase.rounds, function(round, round_id) {

                            $scope.rounds.push({
                                id: round_id,
                                name: CommonFunctions.getPhaseTranslation(phase.phase.type, phase.phase.number)+' - '+'Fecha '+round.number,
                                id_round: round.number
                            });

                            if(phase.phase.id == competition.competition.active_phase_id && round.id == competition.competition.active_round_id){
                                $scope.round = $scope.rounds[index];
                                $scope.getSchedulesMatches(id, season, $scope.round);
                            }

                            index++;
                        });
                    });

                    if($scope.round == null){
                        $scope.round = $scope.rounds[index-1];
                        $scope.getSchedulesMatches(id, season, $scope.round);
                    }
                /*}else{*/
                    $(".widget-dim-content .loadlayer").hide(0);
                /*}*/

            }, function(response){
                $(".widget-dim-content .loadlayer").hide(0);
            });
        }

        if(service.id == "positions"){
            $http.get('https://s3-us-west-2.amazonaws.com/dimayor-opta-feeds/summary/'+id+'/'+season+'/all.json',{
                headers: {
                    'Cache-Control' : 'no-cache'
                }
            }).then(function(response){
                /*$scope.trnmnt = id;
                if(response.data.competition){*/
                    var phase_id = response.data.competition.active_phase_id;
                    $scope.phases = [];

                    angular.forEach(response.data.phases, function(phase, key) {
                        var temp = {
                            id: key,
                            name: CommonFunctions.getPhaseTranslation(phase.phase.type, phase.phase.number)
                        };

                        $scope.phases.push(temp);

                        if(key == phase_id){
                            $scope.phase = temp;
                        }
                    });

                    $scope.getPositions(id, season, $scope.phase);
                /*}else{*/
                    $(".widget-dim-content .loadlayer").hide(0);
                /*}*/
            }, function(response){
                $(".widget-dim-content .loadlayer").hide(0);
            });
        }

        if(service.id == "scorers"){
            $http.get('//s3-us-west-2.amazonaws.com/dimayor-opta-feeds/scorers/'+id+'/'+season+'/all.json',{
                headers: {
                    'Cache-Control' : 'no-cache'
                }
            }).then(function(response){

                $scope.scorers = [];

                angular.forEach(response.data.scorers, function(player, player_id) {
                    player.position = CommonFunctions.getPositionTranslation(player.position);
                    $scope.scorers.push(player);
                });

                $scope.scorers = $filter('orderBy')($scope.scorers, 'pos', false);
                $(".widget-dim-content .loadlayer").hide(0);
            }, function(response){
                $(".widget-dim-content .loadlayer").hide(0);
            });
        }

        if(service.id == "decline"){
            $http.get('//s3-us-west-2.amazonaws.com/dimayor-opta-feeds/decline/'+id+'/'+season+'/all.json',{
                headers: {
                    'Cache-Control' : 'no-cache'
                }
            }).then(function(response){

                $scope.decline = [];

                angular.forEach(response.data.teams, function(team, team_id) {
                    $scope.decline.push(team);
                });

                $scope.decline = $filter('orderBy')($scope.decline, '-pos', false);
                $(".widget-dim-content .loadlayer").hide(0);
            }, function(response){
                $(".widget-dim-content .loadlayer").hide(0);
            });

        }
    };

    $scope.getSchedulesMatches = function(id, season, round){
        $(".widget-dim-content .loadlayer").show(0);
        /**/
         if(id=="371" || id=="589"){
             $http.get('https://s3.amazonaws.com/optafeeds-prod/schedules/'+id+'/'+season+'/rounds/'+round.id+'.json',{
                 headers: {
                     'Cache-Control' : 'no-cache'
                 }
             }).then(function(response){
                 $scope.matches_win = {}; $scope.compact_video_win = {};  var matches = []; var chn_url = '';

                 angular.forEach(response.data.matches, function(match, match_id) {
                     matches.push(match);
                 });

                 matches = $filter('orderBy')(matches, "date", false);

                 MatchsTournamentWinsports.async(id+'-'+season).then(function (winsport_matches) {
                     angular.forEach(matches, function(match, key) {
                        var match_filter = $filter('filter')(winsport_matches, {opta_id: match.id}, true);
                        if(match_filter.length > 0 && match_filter[0].ruta_compact_video !== '/node/'){
                            $scope.compact_video_win[key] = {
                                id: match.id,
                                ruta_compact_video: 'http://www.winsports.co/' + match_filter[0].ruta_compact_video
                            };
                        }
                        if (match_filter[0].chn_image !== null) {
                            if (match_filter[0].chn_image.src.indexOf('canal-rcn') !== -1) {
                               chn_url = 'http://www.winsports.co/';
                            }else{
                                chn_url = 'http://www.winsports.co/';
                            }

                            $scope.matches_win[key] = {
                                id: match.id,
                                chn_image: match_filter[0].chn_image&&match_filter[0].chn_image.src,
                                path: chn_url
                            };
                        }
                     });
                 }, function(response){
                     angular.forEach(matches, function(match, key) {
                        var match_filter = $filter('filter')(winsport_matches, {opta_id: match.id}, true);
                        if(match_filter.length > 0 && match_filter[0].ruta_compact_video !== '/node/'){
                            $scope.compact_video_win[key] = {
                                id: match.id,
                                ruta_compact_video: 'http://www.winsports.co/' + match_filter[0].ruta_compact_video
                            };
                        }
                        if (match_filter[0].chn_image !== null) {
                            if (match_filter[0].chn_image.src.indexOf('canal-rcn') !== -1) {
                               chn_url = 'http://www.canalrcn.com/';
                            }else{
                                chn_url = 'http://www.winsports.co/';
                            }
                            $scope.matches_win[key] = {
                                id: match.id,
                                chn_image: match_filter[0].chn_image&&match_filter[0].chn_image.src,
                                path: chn_url
                            };
                        }
                     });
                 });
             });
         }
         /**/
        $http.get('https://s3-us-west-2.amazonaws.com/dimayor-opta-feeds/schedules/'+id+'/'+season+'/rounds/'+round.id+'.json',{
            headers: {
                'Cache-Control' : 'no-cache'
            }
        }).then(function(response){

            $scope.matches = {};
            var matches = [];

            angular.forEach(response.data.matches, function(match, match_id) {
                matches.push(match);
            });

            matches = $filter('orderBy')(matches, "date", false);

            angular.forEach(matches, function(match, key) {
                //Cambiar formato periodo del partido
                match.period = match.period.toUpperCase();

                var actual = new Date();
                var inicio = new Date(match.date);
                var fin = new Date(inicio.setSeconds(7200));
                if(match.period != 'POSTPONED' && match.perdio != 'TBC' && match.period != 'FULLTIME' && actual > fin) {
                    match.period = "FULLTIME";
                }

                var this_date = match.date.split(' ')[0];
                var new_date = this_date;
                var new_hour = match.date.split(' ')[1];
                match.date = new_hour.split(':')[0]+':'+new_hour.split(':')[1];

                if(id=="589"){
                    match.href = "http://dimayor.com.co/gamecast/?competition="+id+"&season="+season+"&match="+match.id+"&round="+response.data.round.id+"#";
                }else{
                    match.href = "#";
                }

                if( match.period == 'POSTPONED'){
                  this_date = 'aplazado';
                  if(this_date in $scope.matches){
                      $scope.matches[this_date].group.push(match);
                  }else{
                    $scope.matches['aplazado'] = {
                        time: '',
                        group: [match]
                    };
                  }
                }
                else if( match.period == 'TBC'){
                  this_date = 'por_definir';
                  if(this_date in $scope.matches){
                      $scope.matches[this_date].group.push(match);
                  }else{
                    $scope.matches['por_definir'] = {
                        time: '',
                        group: [match]
                    };
                  }
                }
                else if(this_date in $scope.matches){
                    $scope.matches[this_date].group.push(match);
                }else{
                    $scope.matches[this_date] = {
                        time: new_date,
                        // tis: match.tis,
                        group: [match]
                    };
                }
                /*console.log(match);*/
            });

            $(".widget-dim-content .loadlayer").hide(0);
        }, function(response){
            $(".widget-dim-content .loadlayer").hide(0);
        });
    }

    $scope.getPositions = function(id, season, phase){
        $(".widget-dim-content .loadlayer").show(0);
        $http.get('//s3-us-west-2.amazonaws.com/dimayor-opta-feeds/positions/'+id+'/'+season+'/phases/'+phase.id+'.json', {
            headers: {
                'Cache-Control' : 'no-cache'
            }
        }).then(function(response){

            $scope.stages = [];
            var index = 1;

            if('groups' in response.data){
                angular.forEach(response.data.groups, function(group, key) {
                    var teams = [];
                    angular.forEach(response.data.groups[key], function(team_id, key2) {
                        response.data.teams[team_id].id = team_id;
                        teams.push(response.data.teams[team_id]);
                    });

                    $scope.stages.push({
                        id: key,
                        name: "Grupo "+index,
                        teams: $filter('orderBy')(teams, 'pos', false)
                    });

                    index++;
                });
            }else{
                var teams = [];

                angular.forEach(response.data.teams, function(team, id) {
                    response.data.teams[id].id = id;
                    teams.push(response.data.teams[id]);
                });

                $scope.stages.push({
                    id: response.data.phase.id,
                    name: response.data.phase.type,
                    teams: $filter('orderBy')(teams, 'pos', false)
                });
            }

            $(".widget-dim-content .loadlayer").hide(0);
        }, function(response){
            $(".widget-dim-content .loadlayer").hide(0);
        });
    }

    $scope.getCriticalEvents = function(tournament, match, $event){
        var $this = angular.element($event.currentTarget);

        if($this.text() == '+'){
            // minuto a minuto opta
            $http.get('//s3-us-west-2.amazonaws.com/dimayor-opta-feeds/formations/'+tournament.id+'/'+tournament.season+'/matches/'+match.id+'.json')
                .then(function(response){

                $('.match-'+match.id).show(300);
                $this.text('-');

                var formation = response.data

                $scope.events[match.id] = {};
                $scope.events[match.id][match.home.id] = {
                    "yellow_cards" : [],
                    "red_cards" : [],
                    "goals" : []
                }
                $scope.events[match.id][match.away.id] = {
                    "yellow_cards" : [],
                    "red_cards" : [],
                    "goals" : []
                }

                angular.forEach(formation.teams, function(team, id_team){
                    angular.forEach(team.players.Start, function(player, id_player){
                        angular.forEach(player.events, function(event, id_event){
                            if(event.type == "yellow-card"){
                                $scope.events[match.id][id_team].yellow_cards.push({
                                    name: player.name,
                                    min: event.min,
                                });
                            }
                            if(event.type == "red-card"){
                                $scope.events[match.id][id_team].red_cards.push({
                                    name: player.name,
                                    min: event.min,
                                });
                            }
                            if(event.type == "goal" || event.type == "Goal"){
                                $scope.events[match.id][id_team].goals.push({
                                    name: player.name,
                                    min: event.min,
                                });
                            }
                        });
                    });
                    angular.forEach(team.players.Sub, function(player, id_player){
                        angular.forEach(player.events, function(event, id_event){
                            if(event.type == "yellow-card"){
                                $scope.events[match.id][id_team].yellow_cards.push({
                                    name: player.name,
                                    min: event.min,
                                });
                            }
                            if(event.type == "red-card"){
                                $scope.events[match.id][id_team].red_cards.push({
                                    name: player.name,
                                    min: event.min,
                                });
                            }
                            if(event.type == "goal" || event.type == "Goal"){
                                $scope.events[match.id][id_team].goals.push({
                                    name: player.name,
                                    min: event.min,
                                });
                            }
                        });
                    });
                });
            }, function (response){
                $scope.gamecast_error = true;
            });
        }else{
            $('.match-'+match.id).hide(300);
            $this.text('+');
        }
    }

    $interval(function(){
        // $scope.getData();
    },20000);

    $scope.showWidget = function () {
        if ($state.current.url == '/') {
            return true;
        } else {
            return false;
        }
    }

    $scope.showGamecast = function (href) {
        if( href != '#') {
            return true;
        }else {
          return false;
        }
    }

}]);
