var HDA;

(function (HDA) {
    HDA[HDA["Home"] = 0] = "Home";
    HDA[HDA["Draw"] = 1] = "Draw";
    HDA[HDA["Away"] = 2] = "Away";
})(HDA || (HDA = {}));

function calculateTeamScoringChances(timeRemaining, xg) {
    const scoreChance = xg * timeRemaining / 270;
    const noScoreChance = 1 - scoreChance;
    const score0 = noScoreChance * noScoreChance * noScoreChance;
    const score1 = scoreChance * noScoreChance * noScoreChance * 3;
    const score2 = scoreChance * scoreChance * noScoreChance * 3;
    const score3 = scoreChance * scoreChance * scoreChance;
    return {
        score0, score1, score2, score3
    };
}
function calculateScoreChange(home, away) {
    return {
        H3: home.score3 * away.score0,
        H2: home.score3 * away.score1 + home.score2 * away.score0,
        H1: home.score3 * away.score2 + home.score2 * away.score1 + home.score1 * away.score0,
        draw: home.score3 * away.score3 + home.score2 * away.score2 + home.score1 * away.score1 + home.score0 * away.score0,
        A1: away.score3 * home.score2 + away.score2 * home.score1 + away.score1 * home.score0,
        A2: away.score3 * home.score1 + away.score2 * home.score0,
        A3: away.score3 * home.score0
    };
}
function calculateFinalPrediction(scoreChange, game) {
    let home = 0;
    let draw = 0;
    let away = 0;
    switch (whoWins(game.goalsHome + 3, game.goalsAway)) {
        case HDA.Home:
            home += scoreChange.H3;
            break;
        case HDA.Draw:
            draw += scoreChange.H3;
            break;
        case HDA.Away:
            away += scoreChange.H3;
    }
    switch (whoWins(game.goalsHome + 2, game.goalsAway)) {
        case HDA.Home:
            home += scoreChange.H2;
            break;
        case HDA.Draw:
            draw += scoreChange.H2;
            break;
        case HDA.Away:
            away += scoreChange.H2;
    }
    switch (whoWins(game.goalsHome + 1, game.goalsAway)) {
        case HDA.Home:
            home += scoreChange.H1;
            break;
        case HDA.Draw:
            draw += scoreChange.H1;
            break;
        case HDA.Away:
            away += scoreChange.H1;
    }
    switch (whoWins(game.goalsHome, game.goalsAway)) {
        case HDA.Home:
            home += scoreChange.draw;
            break;
        case HDA.Draw:
            draw += scoreChange.draw;
            break;
        case HDA.Away:
            away += scoreChange.draw;
    }
    switch (whoWins(game.goalsHome, game.goalsAway + 1)) {
        case HDA.Home:
            home += scoreChange.A1;
            break;
        case HDA.Draw:
            draw += scoreChange.A1;
            break;
        case HDA.Away:
            away += scoreChange.A1;
    }
    switch (whoWins(game.goalsHome, game.goalsAway + 2)) {
        case HDA.Home:
            home += scoreChange.A2;
            break;
        case HDA.Draw:
            draw += scoreChange.A2;
            break;
        case HDA.Away:
            away += scoreChange.A2;
    }
    switch (whoWins(game.goalsHome, game.goalsAway + 3)) {
        case HDA.Home:
            home += scoreChange.A3;
            break;
        case HDA.Draw:
            draw += scoreChange.A3;
            break;
        case HDA.Away:
            away += scoreChange.A3;
    }
    return {
        home, draw, away
    };
}
function whoWins(home, away) {
    if (home > away) {
        return HDA.Home;
    }
    if (home < away) {
        return HDA.Away;
    }
    return HDA.Draw;
}
function parseTime(status) {
    if (status === 'FT') {
        return 90;
    }
    if (status === 'HT') {
        return 45;
    }

    status = status.split('+')[0];
    if (validateNumber(status)) {
        throw new Error(`Invalid Status: ${status}`);
    }

    return parseInt(status, 10); // return the number or NaN if something else
}
function validateNumber(x) {
    return isNaN(parseInt(x, 10));
}

window.generatePrediction = function (game, homeXG = 2.2, awayXG = 1.7) {
  const time = parseTime(game.status);
  if (time > 85) {
      switch (whoWins(game.goalsHome, game.goalsAway)) {
          case HDA.Home:
              return {
                  home: 1, draw: 0, away: 0
              };
          case HDA.Draw:
              return {
                  home: 0, draw: 1, away: 0
              };
          case HDA.Away:
              return {
                  home: 0, draw: 0, away: 1
              };
      }
  }
  const timeLeft = 90 - time;
  
  const teamA = calculateTeamScoringChances(timeLeft, homeXG);
  const teamB = calculateTeamScoringChances(timeLeft, awayXG);
  const scoreChange = calculateScoreChange(teamA, teamB);
  const prediction = calculateFinalPrediction(scoreChange, game);
  return prediction;
}
window.generatePrediction = generatePrediction;
