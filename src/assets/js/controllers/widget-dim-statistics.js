dimApp.controller('WidgetDimStatisticsController', 
    ['$scope', '$interval', '$filter', '$http', 'CommonFunctions', 
    function ($scope, $interval, $filter, $http, CommonFunctions) {

    $http.get('//s3-us-west-2.amazonaws.com/winsports-new/widget-win-tournament.json',{
        headers: {
            'Cache-Control' : 'no-cache'
        } 
    }).then(function(response){
        $scope.tabs = response.data;
        $scope.getTournament(response.data[0]);
    });

    $scope.getTournament = function(tournament){
        $(".widget-dim-content .loadlayer").show(0);
        $scope.tournament = tournament;
        $scope.active_tournament_tabs = tournament.tabs;
        $scope.getData(tournament.id, tournament.season, tournament.tabs[1]);
    }

    $scope.getData = function(id, season, service){
        $(".widget-dim-content .loadlayer").show(0);
        $scope.active_tournament_tab = service;

        if(service.id == "schedules"){
            $http.get('https://s3.amazonaws.com/optafeeds-prod/summary/'+id+'/'+season+'/all.json',{
                headers: {
                    'Cache-Control' : 'no-cache'
                } 
            }).then(function(response){
                $scope.rounds = [];
                $scope.round = null;
                var index = 0;

                var competition = response.data;

                angular.forEach(competition.phases, function(phase, phase_id) {
                    angular.forEach(phase.rounds, function(round, round_id) {
                        $scope.rounds.push({
                            id: round_id,
                            name: CommonFunctions.getPhaseTranslation(phase.phase.type, phase.phase.number)+' - '+'Fecha '+round.number
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

            }, function(response){
                $(".widget-dim-content .loadlayer").hide(0);
            });
        }

        if(service.id == "positions"){
            $http.get('https://s3.amazonaws.com/optafeeds-prod/summary/'+id+'/'+season+'/all.json',{
                headers: {
                    'Cache-Control' : 'no-cache'
                } 
            }).then(function(response){
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
            }, function(response){
                $(".widget-dim-content .loadlayer").hide(0);
            });
        }

        if(service.id == "scorers"){
             $http.get('//s3.amazonaws.com/optafeeds-prod/scorers/'+id+'/'+season+'/all.json?timestamp='+CommonFunctions.getRandomHash(),{
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
    };

    $scope.getSchedulesMatches = function(id, season, round){
        $(".widget-dim-content .loadlayer").show(0);
        $http.get('https://s3.amazonaws.com/optafeeds-prod/schedules/'+id+'/'+season+'/rounds/'+round.id+'.json',{
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
                var this_date = match.date.split(' ')[0];
                match.date = new Date(match.date).getTime();

                if(this_date in $scope.matches){
                    $scope.matches[this_date].group.push(match);
                }else{
                    $scope.matches[this_date] = {
                        time: match.date,
                        // tis: match.tis,
                        group: [match]
                    };
                }
            });

            $(".widget-dim-content .loadlayer").hide(0);
        }, function(response){
            $(".widget-dim-content .loadlayer").hide(0);
        });
    }

    $scope.getPositions = function(id, season, phase){
        $(".widget-dim-content .loadlayer").show(0);
        $http.get('//s3.amazonaws.com/optafeeds-prod/positions/'+id+'/'+season+'/phases/'+phase.id+'.json', {
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
            $('.match-'+match.id).show(300);
            $this.text('-');
        }else{
            $('.match-'+match.id).hide(300);
            $this.text('+');        
        }
        // minuto a minuto opta
        // $http.get('//s3.amazonaws.com/optafeeds-prod/gamecast/'+tournament.id+'/'+tournament.season+'/matches/'+match.id+'.json',{
        $http.get('//s3.amazonaws.com/optafeeds-prod/gamecast/'+tournament.id+'/'+tournament.season+'/matches/902976.json',{
        // $http.get('//s3.amazonaws.com/optafeeds-prod/gamecast/'+opta_tournament+'/'+opta_season+'/matches/902969.json',{
            headers: {
                'Cache-Control' : 'no-cache'
            } 
        }).then(function(response){
            var temp = response.data.events.shift();
            $scope.min_a_min = $filter('orderBy')(response.data.events, ['-period','-minute', '-second'], false);
            $scope.min_a_min.push(temp);

            angular.forEach($scope.min_a_min, function(event, index){
                // console.log(event);
            });

        }, function (response){
            $scope.gamecast_error = true;
        });
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
}]);